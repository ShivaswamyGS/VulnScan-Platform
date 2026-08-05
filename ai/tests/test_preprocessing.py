from ai.src.preprocessing import clean_text, preprocess


def test_preprocess_lowercases_and_removes_stopwords():
    result = preprocess("The System Is Vulnerable To An Attack")
    assert result == "system vulnerable attack"


def test_preprocess_removes_urls():
    result = preprocess("See https://example.com/advisory for details")
    assert "http" not in result
    assert "example.com" not in result


def test_preprocess_preserves_cve_identifiers():
    result = preprocess("This relates to CVE-2023-1234 directly")
    assert "cve-2023-1234" in result


def test_preprocess_preserves_version_numbers():
    result = preprocess("Affects version 2.1.3 of the library")
    assert "2.1.3" in result


def test_preprocess_empty_input_returns_empty_string():
    assert preprocess("") == ""
    assert preprocess("   ") == ""


def test_preprocess_strips_html_tags():
    result = preprocess("<script>alert(1)</script> reflected XSS")
    assert "<script>" not in result
    assert "xss" in result


def test_clean_text_lowercases():
    assert clean_text("SQL INJECTION") == "sql injection"
