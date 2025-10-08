import re
from playwright.sync_api import Page, expect

def test_dashboard_loads_with_mock_data(page: Page):
    """
    This test verifies that the dashboard page loads correctly
    by mocking the API response to avoid dependency on a live backend.
    """
    # Define the mock response for the categories API call.
    mock_categories = [
        {
            "id": 1,
            "name": "Dev Tools",
            "enabled": True,
            "sortOrder": 1,
            "applicationSortMode": "CUSTOM",
            "applications": [
                {
                    "id": 101,
                    "name": "Jira",
                    "url": "#",
                    "iconUrlThumbnail": "https://i.imgur.com/3q2kCj1.png",
                    "applicationCategories": [{"category": {"id": 1}, "sortOrder": 1}]
                }
            ]
        }
    ]

    # Intercept the API call and provide the mock response.
    page.route("**/api/categories", lambda route: route.fulfill(
        status=200,
        json=mock_categories
    ))

    # 1. Arrange: Go to the login page.
    page.goto("http://localhost:4200/login")

    # 2. Act: "Log in" by clicking the login button.
    login_button = page.get_by_role("button", name="Login")
    login_button.click()

    # 3. Assert: Wait for navigation and check for content.
    expect(page).to_have_url(re.compile(r".*/dashboard"))
    expect(page.get_by_role("heading", name="Port-url")).to_be_visible()

    # Wait for the mocked category to be rendered.
    expect(page.get_by_text("Dev Tools")).to_be_visible()
    # Wait for the mocked application to be rendered.
    expect(page.get_by_text("Jira")).to_be_visible()

    # 4. Screenshot: Capture the final result.
    page.screenshot(path="jules-scratch/verification/verification.png")