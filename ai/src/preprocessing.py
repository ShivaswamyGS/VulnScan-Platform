"""
NLP preprocessing pipeline for vulnerability report text.

Used identically in two places, which is exactly why it lives here as a
single reusable module rather than being duplicated:
1. ai/src/train.py    — preprocesses the entire NVD training corpus
2. backend prediction service — preprocesses a single incoming report at
   inference time

If these two ever drifted apart (e.g. training lowercases but the API
doesn't), the model's real-world accuracy would silently degrade even
though nothing "errors out" — so keeping one implementation is a
correctness requirement, not just tidiness.
"""

import re
import string

import nltk

from ai.config import NLTK_DATA_DIR

NLTK_DATA_DIR.mkdir(parents=True, exist_ok=True)
if str(NLTK_DATA_DIR) not in nltk.data.path:
    nltk.data.path.insert(0, str(NLTK_DATA_DIR))

_REQUIRED_NLTK_RESOURCES = [
    ("tokenizers/punkt", "punkt"),
   # ("tokenizers/punkt_tab", "punkt_tab"),
    ("corpora/stopwords", "stopwords"),
    ("corpora/wordnet", "wordnet"),
    ("corpora/omw-1.4", "omw-1.4"),
]


def ensure_nltk_resources() -> None:
    """Download required NLTK corpora into the project-local data dir if missing."""
    for resource_path, package_name in _REQUIRED_NLTK_RESOURCES:
        try:
            nltk.data.find(resource_path)
        except LookupError:
            nltk.download(package_name, download_dir=str(NLTK_DATA_DIR), quiet=True)


ensure_nltk_resources()

from nltk.corpus import stopwords  # noqa: E402
from nltk.stem import WordNetLemmatizer  # noqa: E402
from nltk.tokenize import word_tokenize  # noqa: E402

_STOPWORDS = set(stopwords.words("english"))
_LEMMATIZER = WordNetLemmatizer()

# CVE identifiers and version-like tokens carry real signal for vulnerability
# text (e.g. "CVE-2023-1234", "v2.1.3") — we protect them from having their
# digits and hyphens stripped, instead of blanket-removing all numbers.
_URL_PATTERN = re.compile(r"https?://\S+|www\.\S+")
_HTML_TAG_PATTERN = re.compile(r"<[^>]+>")
_NON_ALNUM_PATTERN = re.compile(r"[^a-z0-9\s\-\.]")
_MULTI_SPACE_PATTERN = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Lowercase and strip noise (URLs, HTML, punctuation) while preserving
    CVE-style identifiers and version numbers."""
    text = text.lower()
    text = _URL_PATTERN.sub(" ", text)
    text = _HTML_TAG_PATTERN.sub(" ", text)
    text = _NON_ALNUM_PATTERN.sub(" ", text)
    text = _MULTI_SPACE_PATTERN.sub(" ", text).strip()
    return text


def tokenize(text: str) -> list[str]:
    return word_tokenize(text)


def remove_stopwords(tokens: list[str]) -> list[str]:
    return [t for t in tokens if t not in _STOPWORDS and t not in string.punctuation]


def lemmatize(tokens: list[str]) -> list[str]:
    return [_LEMMATIZER.lemmatize(t) for t in tokens]


def preprocess(text: str, *, use_lemmatization: bool = True) -> str:
    """
    Full pipeline: clean -> tokenize -> remove stopwords -> (optional) lemmatize.
    Returns a single space-joined string, ready to feed into TfidfVectorizer.

    Returns an empty string (not None, not an error) for empty/whitespace-only
    input — TfidfVectorizer handles empty documents gracefully, and callers
    (e.g. the prediction API) can check for an empty result to warn the user
    their description was too short to analyze.
    """
    if not text or not text.strip():
        return ""

    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    if use_lemmatization:
        tokens = lemmatize(tokens)
    return " ".join(tokens)
