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
    
@pytest.mark.order(11)
def test_assignQuestionToOneByOneSurvey(driver,base_url):
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

    # --- Aller dans Surveys ---
    surveys_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Surveys']]"))
    )
    surveys_btn.click()
    # --- Sélectionner le survey ---
    survey_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            "//td[.//div[text()='Sondage One-by-One Selenium']]//ancestor::tr"
        ))
    )

    view_btn = survey_row.find_element(By.XPATH, ".//button[@title='View Survey']")
    view_btn.click()

    # --- Attendre que le modal apparaisse ---
    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    # --- Cliquer sur "Add Existing Questions" ---
    add_existing_btn = WebDriverWait(modal, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            ".//button[contains(text(),'Add Existing Questions')]"
        ))
    )
    add_existing_btn.click()
    time.sleep(0.5)

    # --- Attendre que le modal contenant les questions apparaisse ---
    questions_modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )
    time.sleep(0.3)

    # --- Récupérer tous les boutons "Add to Survey" dans ce modal ---
    add_buttons = questions_modal.find_elements(By.XPATH, ".//button[contains(text(),'Add to Survey')]")

    # --- Cliquer sur chaque bouton ---
    for btn in add_buttons:
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable(btn))
        btn.click()
        time.sleep(0.3)  # petit délai pour laisser le DOM se mettre à jour
    
    close_btn = WebDriverWait(driver, 10).until(
         EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Close modal']"))
    )
    driver.execute_script("arguments[0].click();", close_btn)
    time.sleep(0.5)

    # Attendre que toutes les questions soient visibles dans le survey
    questions_elements = driver.find_elements(By.XPATH, "//p[starts-with(text(),'Question :')]")

    # Récupérer le texte de chaque question
    questions_texts = [q.text.replace("Question : ", "") for q in questions_elements]
    time.sleep(0.3)

    # Vérifier qu'au moins une question est présente
    assert len(questions_texts) > 0, "Aucune question n'a été ajoutée au survey"

    # Optionnel : afficher les questions pour debug
    print("Questions présentes dans le survey :", questions_texts)
