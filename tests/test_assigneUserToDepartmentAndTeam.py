import pytest
import time
import tempfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains

# ------------------------------
# Fixture Selenium avec options
# ------------------------------
@pytest.fixture
def driver():
    chrome_options = Options()
    
    # Mode Headless pour CI
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Profil utilisateur temporaire unique
    user_data_dir = tempfile.mkdtemp()
    chrome_options.add_argument(f"--user-data-dir={user_data_dir}")

    # Désactive la détection Selenium
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    
    # Incognito et désactivation gestionnaire mots de passe
    chrome_options.add_argument("--incognito")
    chrome_options.add_experimental_option("prefs", {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False
    })

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )
    driver.maximize_window()
    yield driver
    driver.quit()
    
@pytest.mark.order(15)
def test_assign_user_toDepartment_Team(driver):
    driver.get("http://localhost:3000/")

    # --- Connexion ---
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "email"))
    )
    email_input.send_keys("oumaima@gmail.com")
    password_input = driver.find_element(By.NAME, "password")
    password_input.send_keys("oumaima")
    driver.find_element(By.XPATH, "//button[text()='Sign In']").click()
    WebDriverWait(driver, 10).until(lambda d: "/dashboard" in d.current_url)
    
    # --- Aller dans departments ---
    dep_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Departments']]"))
    )
    dep_btn.click()
    time.sleep(1)

    # --- Trouver le bouton "Manage Users" du département Selenium ---
    manage_users_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//div[.//div[text()='Selenium Department']]//button[@title='Manage Users']"
        ))
    )

    # --- Cliquer dessus ---
    driver.execute_script("arguments[0].click();", manage_users_btn)
    time.sleep(0.5)

    # --- Attendre que le modal apparaisse ---
    manage_users_modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            "//div[h3[text()='Manage Department Users']]"
        ))
    )
    time.sleep(0.5)

    assert manage_users_modal.is_displayed(), "❌ Le modal 'Manage Department Users' ne s'affiche pas"

    
    
    # --- Localiser tous les utilisateurs dans Available Users ---
    available_users = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((
            By.XPATH,
            "//h4[contains(text(),'Available Users')]/following-sibling::div//div[@class='flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200']"
        ))
    )
    time.sleep(1)

    # --- Parcourir chaque div et cliquer sur Assign pour selenium_user ---
    for user_div in available_users:
        user_name = user_div.find_element(By.XPATH, ".//div[@class='font-medium text-gray-900']").text
        if user_name.strip() == "selenium_user":
            assign_button = user_div.find_element(By.XPATH, ".//button[text()='Assign']")
            driver.execute_script("arguments[0].click();", assign_button)
            break

    time.sleep(1)

    # --- Vérifier que selenium_user est bien dans Assigned Users ---
    assigned_user = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            "//div[h4[contains(text(),'Assigned Users')]]//div[.//div[text()='selenium_user']]"
        ))
    )
    time.sleep(0.5)


    assert assigned_user.is_displayed(), "❌ Le user 'selenium_user' n'a pas été assigné au département"

    # --- Cliquer sur le bouton Close pour fermer le modal ---
    close_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='Close']"))
    )
    close_button.click()

    time.sleep(1)

    # --- Aller dans Team ---
    team_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Teams']]"))
    )
    team_btn.click()

    # --- Cliquer sur "View Teams" du département Selenium Department ---
    view_teams_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//td[.//div[text()='Selenium Department']]/following-sibling::td//button[@title='View Teams']"
        ))
    )
    driver.execute_script("arguments[0].click();", view_teams_btn)


    # --- Localiser la team "Selenium Team 1" dans le modal ---
    team_div = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            "//div[contains(@class,'animate-slide-up')]//div[.//div[text()='Selenium Team 1']]"
        ))
    )

    # --- Cliquer sur le bouton "Users" à l'intérieur de cette team ---
    users_button = team_div.find_element(By.XPATH, ".//button[text()='Users']")
    driver.execute_script("arguments[0].click();", users_button)
    time.sleep(1)

    # --- Localiser la liste des utilisateurs dans le modal "Users" ---
    users_list = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((
            By.XPATH,
            "//div[contains(@class,'bg-gray-50')]//div[@class='flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors duration-200']"
        ))
    )

    # --- Parcourir la liste pour trouver "selenium_user" ---
    for user_div in users_list:
        user_name = user_div.find_element(By.XPATH, ".//div[@class='font-medium text-gray-900']").text
        if user_name.strip() == "selenium_user":
            assign_button = user_div.find_element(By.XPATH, ".//button[text()='Assign']")
            driver.execute_script("arguments[0].click();", assign_button)
            break
    time.sleep(1)







