from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
            print("Playwright browser launched successfully.")
            browser.close()
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    run()