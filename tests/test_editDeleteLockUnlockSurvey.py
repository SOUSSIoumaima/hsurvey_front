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


@pytest.mark.order(7)
def test_survey_full_flow(driver,base_url):
    driver.get(base_url)

    # --- Connexion ---
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email"))).send_keys("oumaima@gmail.com")
    driver.find_element(By.NAME, "password").send_keys("oumaima")
    driver.find_element(By.XPATH, "//button[text()='Sign In']").click()
    dashboard_header = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[text()='Dashboard']"))
    )
    assert dashboard_header.is_displayed()
    time.sleep(0.3)

    # --- Aller dans Surveys ---
    surveys_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Surveys']]"))
    )
    surveys_btn.click()
    time.sleep(0.3)

    # --- Créer un survey ---
    survey_title = "Sondage Full Flow"
    create_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Survey')]"))
    )
    create_btn.click()
    
    modal = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "fixed")))

    modal.find_element(By.NAME, "title").send_keys(survey_title)
    modal.find_element(By.NAME, "description").send_keys("Description full flow")
    modal.find_element(By.NAME, "type").send_keys("FEEDBACK")
    modal.find_element(By.NAME, "responseType").send_keys("ALL_IN_ONE_PAGE")

    deadline_input = modal.find_element(By.ID, "deadline")
    deadline_input.click()
    deadline_input.send_keys("23102025")
    deadline_input.send_keys(Keys.ARROW_RIGHT)
    deadline_input.send_keys("0209")
    deadline_input.send_keys(Keys.ARROW_RIGHT)
    deadline_input.send_keys("AM")

    modal.find_element(By.XPATH, "//button[@type='submit']").click()
   
    # --- Vérifier la création ---
    survey_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//tbody//tr[.//div[text()='{survey_title}']]"))
    )

    # --- Update via modal ---
    updated_title = survey_title + " - Updated"
    edit_btn = survey_row.find_element(By.XPATH, ".//button[@title='Edit Survey']")
    edit_btn.click()
    edit_modal = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "fixed")))

    title_input = edit_modal.find_element(By.NAME, "title")
    title_input.clear()
    title_input.send_keys(updated_title)

    description_input = edit_modal.find_element(By.NAME, "description")
    description_input.clear()
    description_input.send_keys("Description mise à jour full flow")

    edit_modal.find_element(By.XPATH, "//button[text()='Update Survey']").click()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element(edit_modal))
    time.sleep(0.5)


    # --- Lock Survey ---
    updated_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//tbody//tr[.//div[text()='{updated_title}']]"))
    )
    lock_btn = updated_row.find_element(By.XPATH, ".//button[contains(@title,'Click to lock')]")
    lock_btn.click()

    # --- Confirmer le lock via modal ---
    modal_confirm = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//div[contains(@class,'fixed')]//button[contains(.,'Lock Survey')]"
        ))
    )
    modal_confirm.click()
    time.sleep(0.5)

    # --- Rechercher à nouveau le bouton après le lock ---
    lock_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            f"//tbody//tr[.//div[text()='{updated_title}']]//button[contains(@title,'Survey is locked')]"
        ))
    )
    assert "locked" in lock_btn.get_attribute("title").lower()

    # --- Unlock Survey ---
    lock_btn.click()
    time.sleep(0.5)

    # --- Confirmer l'unlock via modal ---
    modal_confirm = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//div[contains(@class,'fixed')]//button[contains(.,'Unlock Survey')]"
        ))
    )
    modal_confirm.click()

    # --- Rechercher à nouveau le bouton après l'unlock ---
    unlock_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            f"//tbody//tr[.//div[text()='{updated_title}']]//button[contains(@title,'Survey is unlocked')]"
        ))
    )
    assert "unlocked" in unlock_btn.get_attribute("title").lower()

    # --- Delete ---
    # --- Localiser la ligne du survey à supprimer ---
    survey_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//tbody//tr[.//div[text()='{updated_title}']]"))
    )

    # --- Cliquer sur le bouton Delete ---
    delete_btn = survey_row.find_element(By.XPATH, ".//button[contains(@title, 'Delete Survey')]")
    delete_btn.click()

    # --- Vérifier que le modal s'affiche ---
    delete_modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )
    time.sleep(0.5)

    # --- Tester le bouton Cancel ---
    cancel_btn = delete_modal.find_element(By.XPATH, ".//button[text()='Cancel']")
    cancel_btn.click()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element(delete_modal))

    # --- Rechercher à nouveau la ligne du survey après fermeture du modal ---
    survey_row = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//tbody//tr[.//div[text()='{updated_title}']]"))
    )
    assert survey_row is not None

    # --- Cliquer à nouveau sur Delete pour confirmer ---
    delete_btn = survey_row.find_element(By.XPATH, ".//button[contains(@title, 'Delete Survey')]")
    delete_btn.click()
    delete_modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    confirm_delete_btn = delete_modal.find_element(By.XPATH, ".//button[contains(text(),'Delete')]")
    confirm_delete_btn.click()
    time.sleep(0.5)

    # --- Attendre que le survey disparaisse du DOM ---
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((By.XPATH, f"//tbody//tr[.//div[text()='{updated_title}']]"))
    )

    # Vérifier que le survey a été supprimé
    survey_rows = driver.find_elements(By.XPATH, f"//tbody//tr[.//div[text()='{updated_title}']]")
    assert len(survey_rows) == 0