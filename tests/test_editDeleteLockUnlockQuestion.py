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


@pytest.mark.order(9)
def test_edit_question(driver):
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

    # --- Aller dans Question Management ---
    questions_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Questions']]"))
    )
    questions_btn.click()
    time.sleep(1)

    # ----------------------------
    # 4. MULTIPLE CHOICE TEXT
    # ----------------------------
    # --- Cliquer sur Create Question ---
    create_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Question')]"))
    )
    create_btn.click()

    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    # --- Remplir le formulaire Multiple Choice Text ---
    modal.find_element(By.NAME, "subject").send_keys("Sujet Multiple Choice a modifier")
    modal.find_element(By.NAME, "questionText").send_keys("Quelle couleur préférez-vous ?")

    select_type = modal.find_element(By.NAME, "questionType")
    select_type.send_keys("MULTIPLE_CHOICE_TEXT")

    # --- Cliquer 3 fois sur Add option ---
    add_option_btn = modal.find_element(By.XPATH, ".//button[text()='Add option']")
    for _ in range(3):
        add_option_btn.click()
        time.sleep(0.5)  # petit délai pour que le DOM se mette à jour

    # --- Récupérer les divs contenant les options ---
    option_divs = modal.find_elements(By.XPATH, ".//div[contains(@class, 'flex space-x-4 items-center')]")

    # --- Remplir chaque option ---
    # Option 1
    inputs = option_divs[0].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Rouge")  # texte
    inputs[1].clear()
    inputs[1].send_keys("2")      # score
    inputs[2].click()             # correct
    time.sleep(0.5)

    # Option 2
    inputs = option_divs[1].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Bleu")
    inputs[1].clear()
    inputs[1].send_keys("2")
    inputs[2].click()             # correct
    time.sleep(0.5)

    # Option 3
    inputs = option_divs[2].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Vert")
    inputs[1].clear()
    inputs[1].send_keys("0")
    # pas de clic pour correct
    time.sleep(0.5)

    # --- Soumettre le formulaire ---
    submit_btn = modal.find_element(By.XPATH, ".//button[text()='Submit']")
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
    time.sleep(0.3)  # laisser le scroll se stabiliser
    WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, ".//button[text()='Submit']")))
    try:
       submit_btn.click()
    except Exception:
        driver.execute_script("arguments[0].click();", submit_btn)

    # Attendre que le modal disparaisse
    WebDriverWait(driver, 10).until(EC.invisibility_of_element(modal))

    # --- Vérifier que la question apparaît dans la liste ---
    question_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'p-5') and .//p[text()='Quelle couleur préférez-vous ?']]")
        )
    )
    assert question_card is not None
     # --- Cliquer sur Edit ---
    edit_btn = question_card.find_element(By.XPATH, ".//button[@title='Edit Question']")
    edit_btn.click()

    edit_modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    # --- Modifier le texte de la question ---
    question_input = edit_modal.find_element(By.NAME, "questionText")
    question_input.clear()
    question_input.send_keys("updated?")

    # --- Supprimer la troisième option ---
    delete_buttons = edit_modal.find_elements(By.XPATH, ".//button[@title='Delete']")
    delete_buttons[2].click()
    time.sleep(0.5)

    # --- Ajouter une nouvelle option ---
    add_option_btn = edit_modal.find_element(By.XPATH, ".//button[text()='Add option']")
    add_option_btn.click()
    time.sleep(0.5)

    option_divs = edit_modal.find_elements(By.XPATH, ".//div[contains(@class, 'flex space-x-4 items-center')]")
    # Nouvelle option
    inputs = option_divs[-1].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Jaune")
    inputs[1].clear()
    inputs[1].send_keys("3")
    inputs[2].click()  # correct
    time.sleep(0.5)

    # --- Soumettre les modifications ---
    save_btn = edit_modal.find_element(By.XPATH, ".//button[text()='Save']")

    # Scroller le bouton au centre (optionnel mais recommandé)
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", save_btn)
    time.sleep(0.2)  # petit délai pour que le scroll se stabilise

    # Clic via JavaScript
    driver.execute_script("arguments[0].click();", save_btn)

    # Attendre que le modal disparaisse
    WebDriverWait(driver, 10).until(EC.invisibility_of_element(edit_modal))

    # --- Vérifier que le texte de la question a changé ---
    updated_question_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'p-5') and .//p[text()='updated?']]")
        )
    )
    assert updated_question_card is not None

    # --- Identifier la question ---
    question_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'p-5') and .//p[text()='updated?']]")
        )
    )

    # --- Cliquer sur Lock Question ---
    lock_btn = question_card.find_element(By.XPATH, ".//button[@title='Lock Question']")
    lock_btn.click()

    # --- Confirmer le lock via le modal ---
    modal_confirm = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//div[contains(@class,'fixed')]//button[contains(.,'Lock Question')]"
        ))
    )
    modal_confirm.click()

    # --- Vérifier que le bouton est maintenant Unlock ---
    unlock_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            ".//div[contains(@class,'p-5') and .//p[text()='updated?']]//button[@title='Unlock Question']"
        ))
    )
    assert unlock_btn is not None

    # --- Cliquer sur Unlock Question ---
    unlock_btn.click()

    # --- Confirmer l'unlock via le modal ---
    modal_confirm = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//div[contains(@class,'fixed')]//button[contains(.,'Unlock Question')]"
        ))
    )
    modal_confirm.click()

    # --- Vérifier que le bouton est de nouveau Lock ---
    lock_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            ".//div[contains(@class,'p-5') and .//p[text()='updated?']]//button[@title='Lock Question']"
        ))
    )
    assert lock_btn is not None

    # --- Re-sélectionner la question à supprimer ---
    question_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((
            By.XPATH,
            "//div[contains(@class,'p-5') and .//p[text()='updated?']]"
        ))
    )

    # --- Cliquer sur Delete Question ---
    delete_btn = question_card.find_element(By.XPATH, ".//button[@title='Delete Question']")
    delete_btn.click()

    # --- Confirmer la suppression via le modal ---
    modal_confirm_delete = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//div[contains(@class,'fixed')]//button[contains(.,'Delete Question')]"
        ))
    )
    modal_confirm_delete.click()

    # --- Vérifier que la question n'existe plus dans la liste ---
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((
            By.XPATH,
            "//div[contains(@class,'p-5') and .//p[text()='updated?']]"
        ))
    )

