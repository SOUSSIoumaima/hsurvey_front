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


@pytest.mark.order(8)
def test_create_questions(driver,base_url):
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

    # --- Aller dans Question Management ---
    questions_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Questions']]"))
    )
    questions_btn.click()
    time.sleep(1)

    # ----------------------------
    # 1. FREE TEXT
    # ----------------------------

    # --- Cliquer sur Create Question ---
    create_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Question')]"))
    )
    create_btn.click()

    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    # --- Remplir le formulaire Free Text ---
    modal.find_element(By.NAME, "subject").send_keys("Sujet Free Text")
    modal.find_element(By.NAME, "questionText").send_keys("Quelle est votre opinion ?")

    # --- Sélectionner le type FREE_TEXT ---
    select_type = modal.find_element(By.NAME, "questionType")
    select_type.send_keys("FREE_TEXT")

    # --- Soumettre le formulaire ---
    submit_btn = modal.find_element(By.XPATH, ".//button[text()='Submit']")
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
    time.sleep(0.2)  # petit délai pour que le scroll se stabilise
    submit_btn.click()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element(modal))

    # --- Vérifier que la question apparaît dans la liste ---
    question_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'p-5') and .//p[text()='Quelle est votre opinion ?']]")
        )
    )
    assert question_card is not None

    # ----------------------------
    # 2. DATE PICKER
    # ----------------------------

    # --- Cliquer sur Create Question ---
    create_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Question')]"))
    )
    create_btn.click()

    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    # --- Remplir le formulaire Date Picker ---
    modal.find_element(By.NAME, "subject").send_keys("Sujet Date Picker")
    modal.find_element(By.NAME, "questionText").send_keys("Choisissez une date")

    # --- Sélectionner le type DATE_PICKER ---
    select_type = modal.find_element(By.NAME, "questionType")
    select_type.send_keys("DATE_PICKER")

    # --- Soumettre le formulaire ---
    submit_btn = modal.find_element(By.XPATH, ".//button[text()='Submit']")
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
    time.sleep(0.2)  # petit délai pour que le scroll se stabilise
    submit_btn.click()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element(modal))

    # --- Vérifier que la question apparaît dans la liste ---
    question_card = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class,'p-5') and .//p[text()='Choisissez une date']]")
        )
    )
    assert question_card is not None

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
    modal.find_element(By.NAME, "subject").send_keys("Sujet Multiple Choice")
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

    # --- Soumettre le formulaire Multiple Choice Text de manière fiable ---
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


    # ----------------------------
    # SINGLE CHOICE TEXT
    # ----------------------------

    # --- Cliquer sur Create Question ---
    create_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Question')]"))
    )
    create_btn.click()

    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    # --- Remplir le formulaire Single Choice Text ---
    modal.find_element(By.NAME, "subject").send_keys("Sujet Single Choice")
    modal.find_element(By.NAME, "questionText").send_keys("Quel est votre fruit préféré ?")

    select_type = modal.find_element(By.NAME, "questionType")
    select_type.send_keys("SINGLE_CHOICE_TEXT")

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
    inputs[0].send_keys("Pomme")  # texte
    inputs[1].clear()
    inputs[1].send_keys("2")      # score
    inputs[2].click()             # correcte
    time.sleep(0.5)

    # Option 2
    inputs = option_divs[1].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Banane")
    inputs[1].clear()
    inputs[1].send_keys("0")
    # pas de clic pour correct
    time.sleep(0.5)

    # Option 3
    inputs = option_divs[2].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Orange")
    inputs[1].clear()
    inputs[1].send_keys("0")
    # pas de clic pour correct
    time.sleep(0.5)

    # --- Soumettre le formulaire Multiple Choice Text de manière fiable ---
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
            (By.XPATH, "//div[contains(@class,'p-5') and .//p[text()='Quel est votre fruit préféré ?']]")
        )
    )
    assert question_card is not None

    # ----------------------------
    # 5. YES/NO
    # ----------------------------

    # --- Cliquer sur Create Question ---
    create_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Question')]"))
    )
    create_btn.click()

    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "fixed"))
    )

    # --- Remplir le formulaire YES/NO ---
    modal.find_element(By.NAME, "subject").send_keys("Sujet Yes/No")
    modal.find_element(By.NAME, "questionText").send_keys("Aimez-vous le café ?")

    select_type = modal.find_element(By.NAME, "questionType")
    select_type.send_keys("YES_NO")

    # --- Cliquer 2 fois sur Add option ---
    add_option_btn = modal.find_element(By.XPATH, ".//button[text()='Add option']")
    for _ in range(2):
        add_option_btn.click()
        time.sleep(0.5)

    # --- Récupérer les divs contenant les options ---
    option_divs = modal.find_elements(By.XPATH, ".//div[contains(@class, 'flex space-x-4 items-center')]")

    # --- Option 1 : Yes ---
    inputs = option_divs[0].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Yes")   # texte
    inputs[1].clear()
    inputs[1].send_keys("1")     # score
    inputs[2].click()            # correct
    time.sleep(0.5)

    # --- Option 2 : No ---
    inputs = option_divs[1].find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("No")
    inputs[1].clear()
    inputs[1].send_keys("0")
    # pas de clic pour correct
    time.sleep(0.5)

    # --- Soumettre le formulaire Multiple Choice Text de manière fiable ---
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
            (By.XPATH, "//div[contains(@class,'p-5') and .//p[text()='Aimez-vous le café ?']]")
        )
    )
    assert question_card is not None

