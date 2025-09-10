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
    return os.environ.get("REACT_APP_URL", "http://localhost:3000")
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

# Test login correct
@pytest.mark.order(3)
def test_login_success(driver, base_url):
    driver.get(base_url)

    # Saisie email
    email = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "email"))
    )
    email.send_keys("oumaima@gmail.com")

    # Saisie mot de passe
    password = driver.find_element(By.NAME, "password")
    password.send_keys("oumaima")

     # Cliquer sur Sign In
    sign_in = driver.find_element(By.XPATH, "//button[text()='Sign In']")
    sign_in.click()

    # Optionnel : vérifier qu'un élément unique du dashboard est affiché
    dashboard_header = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[text()='Dashboard']"))
    )
    assert dashboard_header.is_displayed()

# Test login incorrect
@pytest.mark.order(5)
def test_login_wrong_password(driver,base_url):
    driver.get(base_url)

    # Saisie email
    email = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "email"))
    )
    email.send_keys("testuser@example.com")

    # Saisie mot de passe incorrect
    password = driver.find_element(By.NAME, "password")
    password.send_keys("wrongpassword")

    # Cliquer sur le bouton Sign In
    sign_in = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    sign_in.click()

    # Attendre le message d'erreur
    error_message = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.text-red-700"))
    )
    assert error_message.is_displayed()
