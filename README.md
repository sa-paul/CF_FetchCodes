# CF FetchCodes Documentation

## Introduction
**CF FetchCodes** is a powerful browser extension designed to enhance the CodeForces experience for developers and coding enthusiasts.

Stuck on a problem? Want to see how your friend solved it? With CF FetchCodes, you can effortlessly fetch and explore the accepted codes of your CodeForces friends directly on the problem page, gaining valuable insights and expanding your coding horizons.

## Installation
To install CF FetchCodes, follow these steps:
1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/cf-fetchcodes/ombmefkchmjbodcoboeagbpaejfojnga).
2. Click on the **"Add to Chrome"** button.
3. A confirmation dialog will appear. Click **"Add extension"** to install CF FetchCodes.
4. Once installed, CF FetchCodes will be added to your browser's toolbar.

## Usage
CF FetchCodes adds a new section named **"Accepted Codes of Friends"** on the sidebar of every CodeForces problem page.

### Step-by-Step Guide:
1. **Visit a Problem:** Go to any problem page on CodeForces (e.g., Problem A in a recent contest).
2. **Find the Sidebar:** Locate the "Accepted Codes of Friends" box on the right sidebar.
3. **Click "Show Codes":** This opens the new list view.
4. **View the List:** A pop-up will appear showing a list of all friends who have solved that problem.
   
   <img src="Documentation/Images/newTheme.png" alt="Loading Progress" width="600"/>
   
   *You can see the progress bar as the extension safely checks your friends' status.*

5. **Expand Code:** Click on any friend's name to expand the section and view their code instantly!
   
   <img src="Documentation/Images/changeLog2.png" alt="Accordion UI View" width="600"/>

6. **Explore:** You can copy the code, read it with syntax highlighting, or click the "View original submission" link to go to the official page.

📺 [YouTube Guide: CF FetchCodes](https://www.youtube.com/watch?v=gcQwU1W23x8) *(Note: Video may show older UI)*

---

## Prerequisites
**Note:** This feature assumes that you have added friends on your CodeForces account.

#### How to Add Friends on CodeForces:
1. Log in to your CodeForces account.
2. Go to the profile page of the user you want to add as a friend.
3. Click the **"Star"** ⭐️ button next to their handle.

<img src="Documentation/Images/friendButton.png" alt="Add Friend Button" width="320"/>

Once you have added friends, CF FetchCodes will be able to display their accepted codes.

## Privacy and Safety (New in v25.11.21)
CF FetchCodes prioritizes your account safety. The extension operates entirely within your browser.

* **Anti-Ban Architecture:** We use "Human-Like" delays and randomization when fetching data to ensure your account is never flagged for rate-limiting by CodeForces.
* **Local Processing:** Your personal data remains secure; no sensitive information is stored on external servers.

## Feedback and Contributions
We welcome your feedback and contributions! If you encounter any issues or have suggestions for enhancements, please visit our [GitHub repository](https://github.com/sa-paul/CF_FetchCodes).

You can submit bug reports, feature requests, or even contribute code through pull requests.

## Support and Contact
If you need any assistance, feel free to reach out to our support team. You can contact us by sending an email to [sayanpauldeveloper@gmail.com](mailto:sayanpauldeveloper@gmail.com).

## Release Notes

### Version 25.11.21 (Major Update)
* **New Accordion UI:** Replaced the old popup with a clean, scrollable list. Click a friend's name to reveal code only when you need it.
* **Smart Caching:** Code is fetched once and saved in memory. Re-opening a friend's code is now instant and saves bandwidth.
* **Safety First:** Implemented a smart batching system that checks friends in small groups to prevent API errors.
* **Progress Bar:** Visual indicator showing how many friends have been checked.

### Version 0.1.0
- **Code Highlighter:** Implemented syntax highlighting similar to the default highlighter on CodeForces.
- **Navigation:** Added clickable links to navigate to a friend's profile and submission.

## Conclusion
CF FetchCodes is your go-to companion for upsolving and learning from your peers. Install CF FetchCodes today and unlock a world of coding possibilities on CodeForces.

**Happy coding!**