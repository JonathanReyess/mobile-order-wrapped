import email
import zipfile
import tempfile
import os
import re
from bs4 import BeautifulSoup
from email.utils import parseaddr
import extract_msg

def extract_name_from_email_header(header):
    name, addr = parseaddr(header)
    if name:
        return name
    if addr:
        parts = re.split(r"[._]", addr.split("@")[0])
        return " ".join(p.capitalize() for p in parts if p)
    return None


def parse_receipt_from_html(html):
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n")

    required = ["Target:", "Duke University", "Transaction #"]
    if not all(r in text for r in required):
        return None

    receipt = {"items": []}

    if m := re.search(r"#(\d{5,})", text):
        receipt["transaction_id"] = m.group(1)

    if m := re.search(r"\d{4}-\d{2}-\d{2} \d{1,2}:\d{2} [AP]M", text):
        receipt["order_time"] = m.group()

    if m := re.search(r"Total\s*\$?(\d+\.\d{2})", text):
        receipt["total"] = float(m.group(1))

    for line in text.splitlines():
        if re.match(r"\d+\.\s+", line):
            receipt["items"].append({"name": line.split(".", 1)[1].strip()})

    return receipt


def parse_single_eml(msg, filename):
    body = ""

    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() in ["text/html", "text/plain"]:
                payload = part.get_payload(decode=True)
                if payload:
                    text = payload.decode(errors="ignore")
                    if len(text) > len(body):
                        body = text
    else:
        body = msg.get_payload(decode=True).decode(errors="ignore")

    receipt = parse_receipt_from_html(body)
    if not receipt:
        return None

    to_header = msg.get("To") or msg.get("Delivered-To")

    return {
        "subject": msg.get("Subject"),
        "recipient_name": extract_name_from_email_header(to_header),
        "attachments": [{
            "filename": filename,
            "parsed_receipt": receipt,
        }]
    }


def parse_msg_file(stream, filename):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".msg") as tmp:
        tmp.write(stream.read())
        path = tmp.name

    msg = extract_msg.Message(path)
    receipt = parse_receipt_from_html(msg.body)
    if not receipt:
        return None

    return {
        "subject": msg.subject,
        "recipient_name": extract_name_from_email_header(msg.to),
        "attachments": [{
            "filename": filename,
            "parsed_receipt": receipt,
        }]
    }


def parse_uploaded_files(files):
    email_data = []

    for file in files:
        name = file.filename.lower()

        if name.endswith(".zip"):
            with tempfile.TemporaryDirectory() as d:
                zip_path = os.path.join(d, "upload.zip")
                file.save(zip_path)

                with zipfile.ZipFile(zip_path) as z:
                    z.extractall(d)

                for root, _, files in os.walk(d):
                    for f in files:
                        path = os.path.join(root, f)
                        if f.endswith(".eml"):
                            with open(path, "rb") as eml:
                                msg = email.message_from_bytes(eml.read())
                                parsed = parse_single_eml(msg, f)
                                if parsed:
                                    email_data.append(parsed)
                        elif f.endswith(".msg"):
                            with open(path, "rb") as msgf:
                                parsed = parse_msg_file(msgf, f)
                                if parsed:
                                    email_data.append(parsed)

        elif name.endswith(".eml"):
            msg = email.message_from_bytes(file.read())
            parsed = parse_single_eml(msg, file.filename)
            if parsed:
                email_data.append(parsed)

        elif name.endswith(".msg"):
            parsed = parse_msg_file(file.stream, file.filename)
            if parsed:
                email_data.append(parsed)

    return email_data
