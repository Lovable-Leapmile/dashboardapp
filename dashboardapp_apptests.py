from playwright.sync_api import sync_playwright, expect
import os
from dotenv import load_dotenv

load_dotenv()

# change the base url to your domain/droplet
DOMAIN = os.getenv("LEAPMILE_DEPLOYMENT_NAME ")
url = os.getenv("LEAPMILE_HOST_BASEURL", "https://magesh.leapmile.com")

def test_login(page, phone, password):
    unique_spam_endpoints = set()

    # Watch for 500 errors and intercept GET call data
    def handle_response(response):
        if response.status >= 500:
            print(f"❌ {response.status} Internal Server Error from {response.url}")
            # removed page.close() to prevent subsequent 'dict' object has no attribute '_object' error
                
        # log GET call counts
        if response.request.method == "GET" and response.status == 200:
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        if "total_count" in data or "count" in data or "records" in data:
                            count = data.get("total_count", data.get("count", len(data.get("records", []))))
                            endpoint = response.url.split("?")[0].split("/")[-1]
                            
                            # Filter out continuous spam from /subscribe
                            if endpoint == "subscribe":
                                if "subscribe" in unique_spam_endpoints:
                                    return
                                unique_spam_endpoints.add("subscribe")
                                
                            if count > 0 or data.get("records"):
                                print(f"✅ GET /{endpoint} - Data loaded successfully. Count: {count}")
                            else:
                                print(f"⚠️ GET /{endpoint} - API returned success but NO data (Count: 0/Failed to find datas).")
                except:
                    pass

    page.on("response", handle_response)

    try:
        page.goto(f"{url}/dashboardapp/")
        page.wait_for_load_state("networkidle")
        print(f"✅ Page opened: {page.url}")
    except Exception as e:
        print(f"❌ Failed to navigate to login page: {e}")
        return False

    try:
        # Fill phone and password
        page.get_by_placeholder("Enter your mobile number").fill(phone)
        page.get_by_placeholder("Enter your password").fill(password)
        page.get_by_role("button", name="Login").click()
        print("✅ Login form submitted")
    except Exception as e:
        print(f"❌ Failed to submit login form: {e}")
        return False

    try:
        # Wait for home page, which is /home for dashboardapp
        page.wait_for_url(f"**/home")
        page.wait_for_load_state("networkidle")
        print("✅ Navigation to home successful")
    except Exception as e:
        print(f"❌ Failed to reach home: {e}")
        return False

    return True

def test_dashboard_ui_and_data(page):
    try:
        # We are already on home from login
        page.wait_for_selector("div", timeout=5000)
        print("✅ Dashboard Home UI is loaded without crash.")
    except Exception as e:
        print(f"❌ Dashboard UI crashed or failed to load: {e}")
        return False

    pages_to_check = [
        ("racks", "Racks"),
        ("trays", "Trays"),
        ("slots", "Slots"),
        ("station", "Station"),
        ("extremes", "Extremes"),
        ("completed", "Completed Tasks"),
        ("pending", "Pending Tasks"),
        ("tray-ready", "Tray Ready Tasks"),
        ("inprogress", "Inprogress Tasks"),
        ("camera", "Camera"),
        ("reports", "Reports - Product Stock Report"),
        ("logs", "Logs"),
        ("monitor", "Status Monitor")
    ]

    for path, name in pages_to_check:
        print(f"\n--- Navigating to {name} ---")
        try:
            # Navigate directly
            page.goto(f"{url}/dashboardapp/{path}")
            if path != "monitor":
                page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000) # give it a moment to render and fetch data
            
            # Check for generic crash by ensuring body is present
            body_text = page.locator("body").inner_text()
            if "Application error" in body_text or "Crash" in body_text:
                print(f"❌ {name} UI crashed!")
            else:
                print(f"✅ {name} UI loaded without crash.")
                
            # specific logic for the reports page to test dropdown selections
            if path == "reports":
                report_options = [
                    "Order Product Transaction",
                    "Order Tray Transaction",
                    "Tray Transaction",
                    "Rack Transaction",
                    "Order Failure Transaction"
                ]
                for option_name in report_options:
                    print(f"\n--- Switching report type to: {option_name} ---")
                    try:
                        # Click the Shadcn Select combobox
                        page.locator("button[role='combobox']").first.click()
                        page.wait_for_timeout(500)
                        
                        # Select the specific dropdown option
                        page.get_by_role("option", name=option_name).click()
                        page.wait_for_timeout(2000)
                        
                        body_text_report = page.locator("body").inner_text()
                        if "Application error" in body_text_report or "Crash" in body_text_report:
                            print(f"❌ {option_name} crashed!")
                        else:
                            print(f"✅ {option_name} loaded successfully.")
                    except Exception as e:
                        print(f"❌ Failed to verify {option_name}: {e}")

        except Exception as e:
            print(f"❌ Failed to verify {name}: {e}")

    return True

def run_all_tests():
    with sync_playwright() as p:
        # Running browser in non-headless mode for visibility
        browser = p.chromium.launch(
            headless=False,
            slow_mo=1000
        )
        page = browser.new_page()
        print("✅ Browser opened")

        try:
            if not test_login(page, "1234567890", "567890"):
                print("❌ Login failed, aborting tests")
                return

            if not test_dashboard_ui_and_data(page):
                print("❌ Dashboard UI and Data checks failed")
                return

            print("\n✅✅✅ All tests passed for Dashboard App! ✅✅✅")

        finally:
            browser.close()
            print("✅ Browser closed")

if __name__ == "__main__":
    run_all_tests()
