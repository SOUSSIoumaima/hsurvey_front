import pytest
import time
import os
import tempfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys

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


@pytest.mark.order(6)
def test_create_multiple_surveys_for_search(driver,base_url):
    driver.get(base_url)

    # --- Connexion ---
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "email"))
    )
    email_input.send_keys("oumaima@gmail.com")
    password_input = driver.find_element(By.NAME, "password")
    password_input.send_keys("oumaima")
    driver.find_element(By.XPATH, "//button[text()='Sign In']").click()
    
    dashboard_header = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[text()='Dashboard']"))
    )
    assert dashboard_header.is_displayed()

    # --- Aller dans Surveys ---
    surveys_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Surveys']]"))
    )
    surveys_btn.click()

    # --- Fonction pour créer un survey ---
    def create_survey(title, response_type):
        # --- Ouvrir la modal ---
        create_survey_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Survey')]"))
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", create_survey_btn)
        create_survey_btn.click()

        modal = WebDriverWait(driver, 10).until(
           EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
        )
        time.sleep(0.5)  # pour que la modal soit prête

        # --- Remplir le formulaire ---
        modal.find_element(By.NAME, "title").send_keys(title)
        modal.find_element(By.NAME, "description").send_keys(f"Description pour {title}")
        modal.find_element(By.NAME, "type").send_keys("FEEDBACK")
        modal.find_element(By.NAME, "responseType").send_keys(response_type)

        deadline_input = modal.find_element(By.ID, "deadline")
        deadline_input.click()
        deadline_input.send_keys("23102025")
        deadline_input.send_keys(Keys.ARROW_RIGHT)
        deadline_input.send_keys("0209")
        deadline_input.send_keys(Keys.ARROW_RIGHT)
        deadline_input.send_keys("AM")

        # --- Cliquer sur submit ---
        submit_btn = modal.find_element(By.XPATH, "//button[@type='submit']")
        driver.execute_script("arguments[0].click();", submit_btn)

        # --- Attendre que la modal disparaisse ---
        WebDriverWait(driver, 10).until(
            EC.invisibility_of_element_located((By.CLASS_NAME, "fixed"))
        )

        # --- Vérifier que le survey a été créé ---
        survey_row = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((
                By.XPATH, f"//tbody//tr[.//div[text()='{title}']]"
            ))
        )
        assert survey_row is not None

    # --- Créer plusieurs surveys ---
    surveys_to_create = [
        ("Sondage All-in-One Selenium", "ALL_IN_ONE_PAGE"),
        ("Sondage One-by-One Selenium", "ONE_BY_ONE_PAGE"),
        ("Sondage Recherche 1", "ALL_IN_ONE_PAGE"),
        ("Sondage Recherche 2", "ONE_BY_ONE_PAGE"),
        ("Sondage Recherche 3", "ALL_IN_ONE_PAGE")
    ]

    for title, response_type in surveys_to_create:
        create_survey(title, response_type)

    # --- Tester la barre de recherche ---
    search_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            "//input[@placeholder='Search surveys by title or description...']"
        ))
    )
    search_input.send_keys("Recherche 2")
    time.sleep(1)

    # Vérifier que le survey correspondant apparaît
    result_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH, "//tbody//tr[.//div[text()='Sondage Recherche 2']]"
        ))
    )
    assert result_row is not None