import { Browser, Builder, By, Key, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import Applicant from './interfaces/applicant';
import admin from 'firebase-admin';
import IApplicant from './interfaces/applicant';


class WgGesucht {
  driver: WebDriver;

  constructor() {
    const builder = new Builder().forBrowser(Browser.CHROME);
    const headlessBuilder = builder.setChromeOptions(new chrome.Options().headless());
    this.driver = headlessBuilder.build();
  }

  async login(email: string, password: string): Promise<void> {
    await this.driver.get('https://www.wg-gesucht.de/');

    // Check if there is a cookie banner
    await this.driver.sleep(500);
    const isCookieBanner = (await this.driver.findElements(By.xpath('//*[@id="cmpwelcomebtnyes"]/a'))).length > 0;
    if (isCookieBanner) {
      await this.driver.findElement(By.xpath('//*[@id="cmpwelcomebtnyes"]/a')).click();
    }

    // open and fill in login stuff
    try {
      await this.driver.findElement(By.xpath('//*[@id="headbar_wrapper"]/div[2]/a[3]')).click();
      await this.driver.sleep(500);
      await this.driver.findElement(By.xpath('//*[@id="login_email_username"]')).sendKeys(email);
      await this.driver.findElement(By.xpath('//*[@id="login_password"]')).sendKeys(password + Key.RETURN);
      await this.driver.sleep(500);
    } catch(e) {
      console.log('small login error');
      this.logout();
    }
  }

  async nextPage(): Promise<void> {
    await this.driver.findElement(By.className('next')).click();
    await this.driver.sleep(1000);
  }

  async getMessageAfter(dbApplicants: Applicant[], db: admin.database.Database): Promise<void> {
    const dbApplMap: Map<string, Applicant> = new Map();
    dbApplicants.forEach((applicant) => applicant.wggId ? dbApplMap.set(applicant.wggId.toString(), applicant) : undefined);

    await this.driver.get('https://www.wg-gesucht.de/nachrichten.html');
    await this.driver.wait(until.titleIs('Nachrichten von :: WG-Gesucht.de ::'));

    let hasNextPage = (await this.driver.findElements(By.className('next'))).length > 0;
    const applicants: IApplicant[] = [];

    let pageNr = 1;
    while(hasNextPage) {
      console.log('Check page nr:', pageNr);
      const elements = await this.driver.findElements(By.css('.conversation_list_item'));
      for(const element of elements) {
        try {
          const panel_element = await element.findElement(By.css('.panel-body'));
          const wggId = await panel_element.getAttribute('data-conversation_id');
          if (!dbApplMap.has(wggId)) {
            console.log(await (await element.findElement(By.css('.panel-body'))).getAttribute('data-conversation_id'));
            const applicant = await this.extractInfos(element, wggId);
            applicants.push(applicant);
          }
        } catch (e) {
          console.error('error by parsing single applicant', e);
        }
      }

      hasNextPage = (await this.driver.findElements(By.className('next'))).length > 0;
      if (hasNextPage) {
        await this.nextPage();
      }
      pageNr++;
    }
    applicants.forEach(async (a) => await this.createApplicant(a, db));
    console.log('all new applicants:', applicants.length);
  }

  private async extractInfos(element: WebElement, wggId: string): Promise<Applicant> {
    const text = await element.findElement(By.css('div.latest_message')).getText();
    const name = (await element.findElement(By.css('div.contacted_user_public_name')).getText()).replace('NEU', '');
    let imageUrl = await element.findElement(By.css('div.img-circle.img-conversation-list')).getCssValue("background-image");
    imageUrl = imageUrl.slice(5, -2);
    imageUrl = imageUrl == 'https://www.wg-gesucht.de/img/placeholder/no_profile_image_unisex.svg' ? '' : imageUrl;
    return {
      name,
      text,
      gender: '',
      when: Date.now(),
      imageUrl,
      id: '',
      note: '',
      wggId,
      status: 'open',
      ratings: {
        till: 0,
        max: 0,
        emily: 0,
        maike: 0
      }
    }
  }

  private async createApplicant(appl: Applicant, db: admin.database.Database): Promise<Applicant> {
    const ref = db.ref('applicants');
    const newRef = ref.push();
    const key = newRef.key;
    
    const newApplicant = await newRef.set({
      ...appl,
      id: key,
    });
    return newApplicant;
  }

  async logout(): Promise<void> {
    const logoutButton = await this.driver.findElement(By.css('.logout_button'));
    console.log(logoutButton);
    logoutButton.click();
    await this.driver.quit();
  }
}

export default WgGesucht;