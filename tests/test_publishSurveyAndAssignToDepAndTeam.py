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


@pytest.mark.order(16)
def test_publish_assign_department_team(driver,base_url):
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
    time.sleep(1)

        # --- Liste des surveys à publier ---
    survey_names = [
        "Sondage All-in-One Selenium",
        "Sondage One-by-One Selenium"
    ]

    for name in survey_names:
        # Trouver la ligne contenant le survey
        survey_row = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(
                (By.XPATH, f"//div[@class='text-sm font-semibold text-gray-900' and text()='{name}']/ancestor::tr")
            )
        )
        
        # Trouver le bouton Publish dans cette ligne
        publish_btn = survey_row.find_element(
            By.XPATH,
            ".//button[@title='Publish Survey']"
        )
        
        # Vérifier si le bouton est clickable
        if publish_btn.is_enabled():
            publish_btn.click()
            # Attendre un petit instant pour que l'action se fasse
            time.sleep(1)
        else:
            print(f"Survey '{name}' est déjà publié ou bouton désactivé.")

    # --- Vérification que les surveys sont publiés ---
    for name in survey_names:
        survey_row = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(
                (By.XPATH, f"//div[@class='text-sm font-semibold text-gray-900' and text()='{name}']/ancestor::tr")
            )
        )
        status_span = survey_row.find_element(By.XPATH, ".//td[3]//span")  # 3ème colonne = statut
        # Attendre que le statut devienne ACTIVE
        WebDriverWait(survey_row, 10).until(
            lambda r: status_span.text == "ACTIVE"
        )
        assert status_span.text == "ACTIVE", f"Le survey '{name}' n'a pas été publié !"

    print("Les 2 surveys ont été publiés avec succès !")

    time.sleep(1)

    # --- Cliquer sur le bouton "Survey Bank" ---
    survey_bank_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[.//span[text()='Survey Bank']]")
        )
    )
    survey_bank_btn.click()
    time.sleep(1)

    # --- Cliquer sur le bouton Assign Survey du premier survey ---
    first_survey_assign_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//div[.//div[text()='Sondage All-in-One Selenium']]//button[@title='Assign Survey']")
        )
    )
    first_survey_assign_btn.click()
    time.sleep(0.2)

    # --- Attendre que le modal apparaisse et sélectionner le department ---
    department_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "department-select"))
    )
    # Cliquer sur le select pour dérouler les options
    department_select.click()
    time.sleep(0.2)

    # Choisir "Selenium Department"
    selenium_option = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//select[@id='department-select']/option[text()='Selenium Department']")
        )
    )
    selenium_option.click()
    time.sleep(0.2)

    # --- Cliquer sur le bouton Assign Survey dans le modal ---
    modal_assign_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[text()='Assign Survey']")
        )
    )
    modal_assign_btn.click()
    time.sleep(0.2)


    # attendre que le modal disparaisse
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element(modal_assign_btn)
    )

    print("Survey assigné au Selenium Department avec succès !")

    # --- Cliquer sur le bouton Assign Survey du premier survey ---
    first_survey_assign_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//div[.//div[text()='Sondage All-in-One Selenium']]//button[@title='Assign Survey']")
        )
    )
    first_survey_assign_btn.click()
    time.sleep(0.2)

    # --- Attendre et cliquer sur le bouton radio "Team" ---
    team_radio = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='radio' and @value='team']"))
    )
    team_radio.click()
    time.sleep(0.2)

    # attendre que le <select> apparaisse
    team_select_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "team-select"))
    )

    # créer l'objet Select
    select = Select(team_select_element)

    # sélectionner par texte visible
    select.select_by_visible_text("Selenium Team 1 (Selenium Department)")
    time.sleep(0.2)

    # --- Cliquer sur le bouton Assign Survey dans le modal ---
    modal_assign_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[text()='Assign Survey']")
        )
    )
    modal_assign_btn.click()
    time.sleep(0.2)

    # attendre que le modal disparaisse
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element(modal_assign_btn)
    )

    print("Survey assigné au Selenium Team 1 avec succès !")

    #--------------------------------------------
    # --- Cliquer sur le bouton Assign Survey du 2eme survey ---
    second_survey_assign_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//tr[.//div[text()='Sondage One-by-One Selenium']]//button[@title='Assign Survey']")
        )
    )
    second_survey_assign_btn.click()

    # --- Attendre que le modal apparaisse ---
    assign_modal = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(
            (By.XPATH, "//h3[text()='Assign Survey']/ancestor::div[contains(@class,'bg-white')]")
        )
    )

    print("Modal Assign Survey ouvert pour le 2ème survey !")

    # --- Cliquer sur le bouton radio "Department" ---
    dep_radio = WebDriverWait(assign_modal, 10).until(
        EC.element_to_be_clickable((By.XPATH, ".//input[@type='radio' and @value='department']"))
    )
    dep_radio.click()
    time.sleep(0.2)


    # --- Attendre que le <select> apparaisse ---
    dep_select_element = WebDriverWait(assign_modal, 10).until(
        EC.presence_of_element_located((By.ID, "department-select"))
    )

    # Sélectionner par texte visible
    Select(dep_select_element).select_by_visible_text("Selenium Department")

    # --- Cliquer sur le bouton Assign Survey dans le modal ---
    modal_assign_btn = WebDriverWait(assign_modal, 10).until(
        EC.element_to_be_clickable((By.XPATH, ".//button[text()='Assign Survey']"))
    )
    modal_assign_btn.click()
    time.sleep(0.2)


    # --- Attendre que le modal disparaisse ---
    modal_xpath = "//h3[text()='Assign Survey']/ancestor::div[contains(@class,'bg-white')]"
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((By.XPATH, modal_xpath))
    )

    print("Survey assigné au Selenium Department avec succès !")


    # --- Cliquer sur le bouton Assign Survey du 2eme survey ---
    second_survey_assign_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//tr[.//div[text()='Sondage One-by-One Selenium']]//button[@title='Assign Survey']")
        )
    )
    second_survey_assign_btn.click()

    # --- Attendre que le modal apparaisse ---
    assign_modal = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h3[text()='Assign Survey']/ancestor::div[contains(@class,'bg-white')]"))
    )

    # --- Cliquer sur Team ---
    team_radio = WebDriverWait(assign_modal, 10).until(
        EC.element_to_be_clickable((By.XPATH, ".//input[@type='radio' and @value='team']"))
    )
    team_radio.click()

    # --- Sélectionner l'équipe ---
    team_select = WebDriverWait(assign_modal, 10).until(
        EC.presence_of_element_located((By.ID, "team-select"))
    )
    Select(team_select).select_by_visible_text("Selenium Team 1 (Selenium Department)")

    # --- Cliquer sur Assign Survey ---
    modal_assign_btn = WebDriverWait(assign_modal, 10).until(
        EC.element_to_be_clickable((By.XPATH, ".//button[text()='Assign Survey']"))
    )
    modal_assign_btn.click()

    # --- Attendre la disparition via le backdrop ---
    backdrop_xpath = "//div[contains(@class,'fixed') and contains(@class,'bg-gray-500')]"
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((By.XPATH, backdrop_xpath))
    )

    print("2ème survey assigné au Selenium Team 1 avec succès !")