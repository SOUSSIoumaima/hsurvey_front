import pytest
import time
import tempfile
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains
@pytest.fixture
def base_url():
    # prend l'URL depuis l'environnement, sinon fallback localhost
    return os.environ.get("REACT_APP_API_URL", "http://localhost:3000")
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

@pytest.mark.order(14)
def test_Create_User_Assign_Role(driver, base_url):
    driver.get(base_url)

    # --- Connexion ---
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "email"))
    )
    email_input.send_keys("oumaima@gmail.com")
    password_input = driver.find_element(By.NAME, "password")
    password_input.send_keys("oumaima")
    driver.find_element(By.XPATH, "//button[text()='Sign In']").click()
    WebDriverWait(driver, 10).until(lambda d: "/dashboard" in d.current_url)
    
    # --- Aller dans users ---
    user_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Users']]"))
    )
    user_btn.click()
    time.sleep(1)
    # --- Cliquer sur le bouton "Add User" ---
    add_user_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(text())='Add User']"))
    )
    driver.execute_script("arguments[0].click();", add_user_btn)

    # --- Attendre le modal ---
    add_user_modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//div[contains(@class,'animate-slide-up')]"))
    )

    # --- Définir les données du nouvel utilisateur ---
    username = "selenium_user"
    email = "selenium_user@example.com"
    password = "password123"

    # --- Remplir le formulaire ---
    username_input = add_user_modal.find_element(By.ID, "username")
    email_input = add_user_modal.find_element(By.ID, "email")
    password_input = add_user_modal.find_element(By.ID, "password")

    username_input.send_keys(username)
    email_input.send_keys(email)
    password_input.send_keys(password)

    # --- Cliquer sur "Add User" du modal ---
    submit_btn = add_user_modal.find_element(By.XPATH, ".//button[normalize-space(text())='Add User']")
    driver.execute_script("arguments[0].click();", submit_btn)

    # --- Vérifier que l'utilisateur apparaît dans la liste ---
    new_user_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            f"//tbody//tr[.//div[contains(normalize-space(text()), '{username}')] and .//div[contains(normalize-space(text()), '{email}')]]"
        ))
    )

    assert new_user_row.is_displayed(), f"❌ L'utilisateur {username} ({email}) n'existe pas dans la liste"

    # --- Récupérer la ligne de l'utilisateur ---
    new_user_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            f"//tbody//tr[.//div[contains(normalize-space(text()), '{username}')] "
            f"and .//div[contains(normalize-space(text()), '{email}')]]"
        ))
    )

    # --- Cliquer sur le username (ou email) ---
    username_cell = new_user_row.find_element(
        By.XPATH, f".//div[contains(normalize-space(text()), '{username}')]"
    )
    driver.execute_script("arguments[0].click();", username_cell)

    # --- Attendre que le modal apparaisse ---
    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//div[contains(@class,'animate-slide-up')]"))
    )

    role_checkbox = WebDriverWait(modal, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            ".//label[.//span[text()='Selenium Role']]//input[@type='checkbox']"
        ))
    )

    role_checkbox.click()

    # --- Cliquer sur "Save Changes" ---
    save_btn = modal.find_element(By.XPATH, ".//button[normalize-space(text())='Save Changes']")
    driver.execute_script("arguments[0].click();", save_btn)

    # --- Attendre que le modal disparaisse ---
    WebDriverWait(driver, 10).until(EC.invisibility_of_element(modal))

    # --- Vérifier dans le tableau que le rôle est assigné ---
    assigned_role = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            "//tbody//tr[.//div[contains(text(), 'selenium_user')]]//td[3]//span[text()='Selenium Role']"
        ))
    )
    assert assigned_role.is_displayed(), "❌ Le rôle Selenium Role n'a pas été assigné"


