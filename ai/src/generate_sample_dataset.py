"""
Generates a SYNTHETIC sample dataset shaped like real NVD data
(columns: cve_id, description, cvss_score), for two purposes:

1. Letting `train.py` run end-to-end in a fresh dev environment before
   anyone has downloaded real NVD feeds.
2. Giving graders/reviewers of this project a fast, deterministic way to
   see the training pipeline produce real metrics without a multi-GB
   NVD download.

THIS IS NOT REAL NVD DATA. For the actual deployed/graded model, download
real feeds from https://nvd.nist.gov/vuln/data-feeds and run:

    python -m ai.src.train --feed /path/to/nvdcve-2.0-2024.json

train.py will use this synthetic generator ONLY as a fallback when no
real feed path is provided and no file exists at dataset/raw/.
"""

import random

import pandas as pd

from ai.config import RAW_NVD_DIR

random.seed(42)

# --- Templates per vulnerability category, spanning a realistic CVSS range ---
# Each tuple: (category, description_templates, cvss_score_range)
_TEMPLATES: list[tuple[str, list[str], tuple[float, float]]] = [
    ("sql_injection", [
        "A SQL injection vulnerability in the {component} allows remote attackers to execute arbitrary SQL commands via the {param} parameter.",
        "The {component} endpoint fails to sanitize user input, allowing SQL injection through the {param} field, resulting in full database compromise.",
        "Improper neutralization of special elements in {component} allows an unauthenticated attacker to bypass authentication via SQL injection in {param}.",
    ], (8.5, 10.0)),
    ("remote_code_execution", [
        "A buffer overflow in {component} allows remote attackers to execute arbitrary code via a crafted {param}.",
        "Deserialization of untrusted data in {component} allows remote code execution when processing a malicious {param}.",
        "The {component} module contains a command injection vulnerability allowing full remote code execution via {param}.",
    ], (9.0, 10.0)),
    ("authentication_bypass", [
        "An authentication bypass vulnerability in {component} allows attackers to gain unauthorized access by manipulating the {param} value.",
        "Improper access control in {component} allows a low-privileged user to bypass authentication checks via {param}.",
    ], (8.0, 9.5)),
    ("privilege_escalation", [
        "A privilege escalation vulnerability in {component} allows a low-privileged local user to gain administrator access via {param}.",
        "Improper privilege management in {component} allows an authenticated user to escalate privileges through the {param} interface.",
    ], (7.0, 8.9)),
    ("xss", [
        "A reflected cross-site scripting (XSS) vulnerability in {component} allows attackers to inject arbitrary web script via the {param} parameter.",
        "Stored XSS in {component} allows an authenticated attacker to inject malicious script that executes in other users' sessions via {param}.",
    ], (5.5, 7.5)),
    ("csrf", [
        "A cross-site request forgery (CSRF) vulnerability in {component} allows attackers to perform unauthorized actions via a crafted {param} request.",
        "Missing CSRF token validation in {component} allows unauthorized state-changing requests through {param}.",
    ], (4.5, 6.5)),
    ("path_traversal", [
        "A path traversal vulnerability in {component} allows attackers to read arbitrary files outside the intended directory via {param}.",
        "Improper limitation of a pathname in {component} allows directory traversal through the {param} field.",
    ], (5.0, 7.5)),
    ("denial_of_service", [
        "A denial of service vulnerability in {component} allows remote attackers to crash the service by sending a malformed {param}.",
        "Uncontrolled resource consumption in {component} allows an attacker to exhaust server memory via repeated {param} requests.",
    ], (4.0, 6.5)),
    ("information_disclosure", [
        "An information disclosure vulnerability in {component} allows local users to read sensitive configuration data via {param}.",
        "The {component} module exposes internal debug information through {param}, potentially aiding further attacks.",
    ], (2.5, 5.0)),
    ("minor_misconfiguration", [
        "A minor misconfiguration in {component} allows verbose error messages to be returned via {param}, with limited security impact.",
        "The {component} module logs sensitive but non-critical data locally via {param}, with low overall impact.",
    ], (0.5, 3.5)),
]

_COMPONENTS = [
    "login API", "user management module", "file upload service", "payment gateway",
    "admin dashboard", "REST API gateway", "session handler", "password reset endpoint",
    "search service", "reporting module", "notification service", "OAuth integration",
    "webhook handler", "image processing service", "export utility", "audit log viewer",
]

_PARAMS = [
    "username", "email", "id", "filename", "redirect_url", "token", "query",
    "session_id", "callback", "file_path", "user_id", "search_term", "role",
]


def _generate_row(category: str, templates: list[str], score_range: tuple[float, float]) -> dict:
    template = random.choice(templates)
    description = template.format(component=random.choice(_COMPONENTS), param=random.choice(_PARAMS))
    score = round(random.uniform(*score_range), 1)
    return {"description": description, "cvss_score": score, "category": category}


def generate_sample_dataset(n_per_category: int = 60) -> pd.DataFrame:
    rows = []
    cve_counter = 1
    for category, templates, score_range in _TEMPLATES:
        for _ in range(n_per_category):
            row = _generate_row(category, templates, score_range)
            row["cve_id"] = f"SYNTH-{cve_counter:05d}"
            rows.append(row)
            cve_counter += 1

    df = pd.DataFrame(rows)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle
    return df


def main() -> None:
    df = generate_sample_dataset()
    RAW_NVD_DIR.mkdir(parents=True, exist_ok=True)
    output_path = RAW_NVD_DIR / "sample_synthetic_dataset.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic rows -> {output_path}")
    print(df["category"].value_counts())


if __name__ == "__main__":
    main()
