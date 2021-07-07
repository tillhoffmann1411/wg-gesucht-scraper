import { Browser, Builder, By, Key, until, WebDriver, WebElement } from 'selenium-webdriver';
import Applicant from './interfaces/applicant';
import admin from 'firebase-admin';


class WgGesucht {
  driver: WebDriver;

  constructor() {
    this.driver = new Builder().forBrowser(Browser.CHROME).build()
  }

  async login(email: string, password: string): Promise<void> {
    await this.driver.get('https://www.wg-gesucht.de/');

    // Check if there is a cookie banner
    await this.driver.sleep(1000);
    const isCookieBanner = (await this.driver.findElements(By.xpath('//*[@id="cmpwelcomebtnyes"]/a'))).length > 0;
    if (isCookieBanner) {
      await this.driver.findElement(By.xpath('//*[@id="cmpwelcomebtnyes"]/a')).click();
    }

    // open and fill in login stuff
    await this.driver.findElement(By.xpath('//*[@id="headbar_wrapper"]/div[2]/a[3]')).click();
    await this.driver.sleep(1000);
    await this.driver.findElement(By.xpath('//*[@id="login_email_username"]')).sendKeys(email);
    await this.driver.findElement(By.xpath('//*[@id="login_password"]')).sendKeys(password + Key.RETURN);
    await this.driver.sleep(1000);
  }

  async getMessageAfter(dbApplicants: Applicant[], db: admin.database.Database): Promise<void> {
    const dbApplMap: Map<string, Applicant> = new Map();

    dbApplicants.forEach((applicant) => applicant.wggId ? dbApplMap.set(applicant.wggId.toString(), applicant) : undefined);

    await this.driver.get('https://www.wg-gesucht.de/nachrichten.html');
    await this.driver.wait(until.titleIs('Nachrichten von :: WG-Gesucht.de ::'));
    const elements = await this.driver.findElements(By.className('conversation_list_item'));

    const applicants: Map<string, {name: string, index: number}> = new Map();
    let index = 0;
    for(const element of elements) {
      try {
        const rawName = await (await element).findElement(By.className('contacted_user_public_name truncate_title')).getText();
        const name = rawName.replace(/[{()}]/g, '').replace(/\s/g, "");
        const panel_element = await element.findElement(By.css('.panel-body'));
        const wggId = await panel_element.getAttribute('data-conversation_id');
        applicants.set(wggId, {name, index});
        index++;
      } catch (e) {
        console.error(e);
      }
    }
    applicants.forEach(async (value: {name: string, index: number}, key: string) => {
      if (!dbApplMap.has(key)) {
        try {
          await this.getApplicationInfo(elements[value.index], key, db);
        } catch(e) {
          console.error('Error by getting applicant information. Key: ', key, value.name);
        }
      }
      return;
    });
  }

  private async getApplicationInfo(element: WebElement, wggId: string, db: admin.database.Database): Promise<any> {
    await this.driver.sleep(1000);
    const text = await element.findElement(By.css('div.latest_message')).getText();
    const name = (await element.findElement(By.css('div.contacted_user_public_name')).getText()).replace('NEU', '');
    let imageUrl = await element.findElement(By.css('div.img-circle.img-conversation-list')).getCssValue("background-image");
    imageUrl = imageUrl.slice(5, -2);
    await this.driver.sleep(1000);

    const ref = db.ref('applicants');
    const newRef = ref!.push()!;
    const key = newRef.key;
    
    const newApplicant = newRef.set({
      name,
      text,
      gender: '',
      when: Date.now(),
      imageUrl,
      id: key,
      note: '',
      wggId,
      ratings: {
        till: 0,
        max: 0,
        maike: 0
      }
    });
    return newApplicant;
  }

  async logout(): Promise<void> {
    // await this.driver.findElement(By.xpath('//*[@id="headbar_wrapper"]/div[2]/div[2]/ul/li[17]/a')).click();
    this.driver.quit();
  }
}

export default WgGesucht;