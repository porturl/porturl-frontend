import re
from playwright.sync_api import Page, expect

def test_dashboard_loads_correctly(page: Page):
    """
    This test verifies that the dashboard page loads correctly after logging in.
    """
    # 1. Arrange: Go to the login page.
    # The dev server runs on port 4200 by default.
    page.goto("http://localhost:4200/login")

    # 2. Act: "Log in" by clicking the login button.
    # In the dev environment, the login is often simplified.
    # We find the button with the text "Login" and click it.
    login_button = page.get_by_role("button", name="Login")
    login_button.click()

    # 3. Assert: Wait for navigation to the dashboard and check for the header.
    # We expect the URL to change to the dashboard path.
    expect(page).to_have_url(re.compile(r".*/dashboard"))

    # We also expect the header title "Port-url" to be visible,
    # confirming the main layout has loaded.
    header_title = page.get_by_role("heading", name="Port-url")
    expect(header_title).to_be_visible()

    # It's good practice to wait for a specific element on the dashboard
    # to ensure the content has loaded before taking a screenshot.
    # We'll wait for the first category card to appear.
    expect(page.locator("mat-card").first).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")