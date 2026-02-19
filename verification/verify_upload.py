from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        # Create a dummy PDF
        with open("verification/dummy.pdf", "wb") as f:
            f.write(b"%PDF-1.4 dummy content")

        page.goto("http://localhost:3000/upload-statement")

        # Take a screenshot to see if the page loaded
        page.screenshot(path="verification/upload_page_initial.png")

        # Wait for the input to exist in the DOM (even if hidden)
        # React Dropzone creates the input dynamically sometimes? No, usually static.
        # But maybe the selector is wrong.

        # Try waiting for it
        try:
            page.wait_for_selector("input[type='file']", state="attached", timeout=5000)

            # Force the hidden input to be visible so Playwright can interact with it
            page.evaluate("document.querySelector('input[type=file]').style.display = 'block'")

            # Set the file
            page.set_input_files("input[type='file']", "verification/dummy.pdf")

            # Wait for parsing
            page.wait_for_timeout(3000)

            # Check for Review Table
            if page.get_by_text("Review Extracted Data").is_visible():
                print("Review Table Visible")
                page.screenshot(path="verification/upload_review.png")
            else:
                print("Review Table NOT Visible")
                page.screenshot(path="verification/upload_failed.png")

        except Exception as e:
            print(f"Input selector failed: {e}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()
