import { test, expect } from "@playwright/test";

async function signIn(page) {
  await page.goto("http://localhost:4000/");
  await page.getByRole("button", { name: "Continue as Guest" }).click();
  await page.getByPlaceholder("Enter your nickname").fill("test name 1");
  await page.getByRole("button", { name: "Join" }).click();
  return page;
}

test.describe("Landing page tests", () => {
  test.beforeEach(async ({ page }) => {
    page = await signIn(page);
    await page.waitForSelector("#joinRoom");
  });

  test("createPrivateRoomButton is visible", async ({ page }) => {
    await page.waitForSelector("#createPrivateRoom");
    const createPrivateRoomButton = await page.$("#createPrivateRoom");
    const isVisible = await createPrivateRoomButton.isVisible();
    expect(isVisible).toBe(true);
  });

  test("createPublicRoomButton is visible", async ({ page }) => {
    await page.waitForSelector("#createPublicRoom");
    const createPublicRoomButton = await page.$("#createPublicRoom");
    const isVisible = await createPublicRoomButton.isVisible();
    expect(isVisible).toBe(true);
  });

  test("joinRoomButton is visible", async ({ page }) => {
    await page.waitForSelector("#joinRoom");
    const joinRoomButton = await page.$("#joinRoom");
    const isVisible = await joinRoomButton.isVisible();
    expect(isVisible).toBe(true);
  });

  test("joinPublicRoomButton is visible", async ({ page }) => {
    await page.waitForSelector("#joinPublicRoom");
    const joinPublicRoomButton = await page.$("#joinPublicRoom");
    const isVisible = await joinPublicRoomButton.isVisible();
    expect(isVisible).toBe(true);
  });

  test("startGameButton is not visible", async ({ page }) => {
    const startGameButton = await page.$("#startGame");
    const isVisible = await startGameButton.isVisible();
    expect(isVisible).toBe(false);
  });

  test("startGameButton exists", async ({ page }) => {
    const startGameButton = await page.$("#startGame");
    expect(startGameButton).toBeTruthy();
  });

  test("joinRoomForm exists", async ({ page }) => {
    const joinRoomForm = await page.$("#joinRoomForm");
    expect(joinRoomForm).toBeTruthy();
  });

  test("roomToJoinInput exists", async ({ page }) => {
    const roomToJoinInput = await page.$("#roomToJoin");
    expect(roomToJoinInput).toBeTruthy();
  });

  test("submitJoinRoomButton exists", async ({ page }) => {
    const submitJoinRoomButton = await page.$("#submitJoinRoom");
    expect(submitJoinRoomButton).toBeTruthy();
  });

  test("submitJoinRoomButton is not visible", async ({ page }) => {
    const submitJoinRoomButton = await page.$("#submitJoinRoom");
    const isVisible = await submitJoinRoomButton.isVisible();
    expect(isVisible).toBe(false);
  });

  test("join room", async ({ page }) => {
    await page.click("#joinRoom");

    // Check if the text area appears
    await page.waitForSelector("#roomToJoin");
    const roomToJoinInput = await page.$("#roomToJoin");
    expect(roomToJoinInput).toBeTruthy();
    const submitJoinRoomButton = await page.$("#submitJoinRoom");
    await page.fill("#roomToJoin", "testRoom");
    await page.click("#submitJoinRoom");
    const isVisible = await submitJoinRoomButton.isVisible();
    expect(isVisible).toBe(true);
  });

  test("join room with invalid id", async ({ page, browserName }) => {
    if (browserName === "chromium") {
      await page.click("#joinRoom");
      await page.fill("#roomToJoin", "invalidRoomId");
      page.on("dialog", (dialog) => {
        expect(dialog.message()).toBe("Room does not exist");
        dialog.dismiss();
      });
      await page.click("#submitJoinRoom");
    } else {
      await page.click("#joinRoom");
      await page.fill("#roomToJoin", "invalidRoomId");

      await page.getByRole("button", { name: "Join Private Game" }).click();
      await page.getByPlaceholder("Enter room ID").click();
      await page.getByPlaceholder("Enter room ID").fill("Invalid");

      const dialogHandler = new Promise((resolve) => {
        page.once("dialog", (dialog) => {
          expect(dialog.message()).toBe("Room does not exist");
          dialog.dismiss();
          resolve();
        });
      });

      await page.click("#submitJoinRoom");
      await dialogHandler;
    }
  });

  test("join room created by another page", async ({ context }) => {
    // Create a room on page1
    const page1 = await context.newPage();
    await page1.goto("http://localhost:4000/landing");
    await page1.click("#createPrivateRoom");
    await page1.waitForSelector("#roomId");
    const roomId = await page1.$eval("#roomId", (el) => el.textContent);

    // Join the room on page2
    const page2 = await context.newPage();
    await page2.goto("http://localhost:4000/landing");
    await page2.click("#joinRoom");
    await page2.waitForSelector("#roomToJoin");
    await page2.fill("#roomToJoin", roomId);
    await page2.click("#submitJoinRoom");

    // Wait for the members count to update on both pages
    await page1.waitForFunction(
      (membersCount) =>
        document.querySelector("#membersCount").textContent === membersCount,
      "2"
    );
    await page2.waitForFunction(
      (membersCount) =>
        document.querySelector("#membersCount").textContent === membersCount,
      "2"
    );

    // Check if the members count is 2 on both pages
    const membersCount1 = await page1.$eval(
      "#membersCount",
      (el) => el.textContent
    );
    const membersCount2 = await page2.$eval(
      "#membersCount",
      (el) => el.textContent
    );
    expect(membersCount1).toBe("2");
    expect(membersCount2).toBe("2");
  });

  test("private room form is not visible after pressing join public room button", async ({
    page,
  }) => {
    // Click on the join private room button
    await page.click("#joinRoom");
    await page.waitForSelector("#joinRoomForm");

    // Click on the join public room button
    await page.click("#joinPublicRoom");

    // wait until publicRoomList has style display:block
    await page.waitForFunction(() => {
      const element = document.querySelector("#publicRoomsList");
      const style = window.getComputedStyle(element);
      return style.display === "block";
    });

    // Check if the private room form is not visible
    const joinRoomForm = await page.$("#joinRoomForm");
    const isVisible = await joinRoomForm.isVisible();
    expect(isVisible).toBe(false);
  });

  test("createPublicRoom button, when pressed, removes buttons", async ({
    page,
  }) => {
    // Click on the create public room button
    await page.click("#createPublicRoom");

    // Check if the room ID is visible
    await page.waitForSelector("#roomId");

    // Check if the buttons are not visible
    const createPublicRoomButton = await page.$("#createPublicRoom");
    const joinPublicRoomButton = await page.$("#joinPublicRoom");
    expect(await createPublicRoomButton.isVisible()).toBe(false);
    expect(await joinPublicRoomButton.isVisible()).toBe(false);
  });

  test("createPublicRoom button, when pressed, shows room ID with members: 1", async ({
    page,
  }) => {
    // Click on the create public room button
    await page.click("#createPublicRoom");

    // Check if the room ID is visible
    await page.waitForSelector("#roomId");
    const roomId = await page.$eval("#roomId", (el) => el.textContent);
    expect(roomId).toBeTruthy();

    // Check if the members count is 1
    await page.waitForSelector("#membersCount");
    const membersCount = await page.$eval(
      "#membersCount",
      (el) => el.textContent
    );
    expect(membersCount).toBe("1");
  });

  test("Usernames are displayed on the landing page", async ({ page }) => {
    // Go to landing page
    const name = "test name 1";

    // Click on the create public room button
    await page.click("#createPublicRoom");

    // Fetch the username elements
    await page.waitForSelector("#membersList");
    const hostText = `${name} (Host)`;
    const hasHost = await page.$eval(
      "#membersList",
      (ul, hostText) => {
        return Array.from(ul.querySelectorAll("li")).some(
          (li) => li.textContent === hostText
        );
      },
      hostText
    );

    expect(hasHost).toBeTruthy();
  });
});
