# Read-only checks of a public Squarespace 7.1 template demo (Bailard). They are
# not part of the default run: `npm run test:real-sites` runs them against the
# live demo sites, which need no account and are not changed by these steps.
@real-site @bailard
Feature: Squarespace 7.1 template demo (Bailard)
  As a tester
  I want the steps to work on a real Squarespace 7.1 site
  So that the pack is proven on the markup Squarespace renders

  Scenario: The site reports its facts
    Given I am on the homepage
    Then the site should use Squarespace 7.1
    And the site title should be "Bailard Foundation"
    And the site language should be "en-US"

  Scenario: Home page hero and footer
    Given I am on the homepage
    Then the hero title should be "Starts With You"
    And the hero call-to-action button should link to "/projects"
    And the site footer should be visible
    And the footer navigation should contain "Squarespace"

  Scenario: The header marks the current page and its folder
    Given I am on "/news"
    Then the site navigation should be visible
    And the site navigation should contain "Read Me"
    And "News" should be the current navigation item
    But "Read Me" should not be the current navigation item

  Scenario: A page inside a folder marks the folder and the page
    Given I am on "/contact"
    Then the "About" navigation folder should contain "Projects"
    And the "About" navigation folder should contain "Contact"
    And "About" should be the current navigation item
    And "Contact" should be the current navigation item

  Scenario: The hero title ignores the post titles of a blog list
    Given I am on "/news"
    Then the hero title should not be "Get Out There!"

  @desktop
  Scenario: A folder opens in the header
    Given I set the viewport to the "desktop" breakpoint
    And I am on "/news"
    When I open the "About" navigation folder
    Then I should see "What We Do"

  @mobile
  Scenario: The burger button opens and closes the mobile menu
    Given I set the viewport to the "mobile" breakpoint
    And I am on "/news"
    Then the mobile navigation toggle should be visible
    And the site navigation should not be visible
    When I open the mobile menu
    Then the mobile menu should be open
    And the mobile menu should contain "Read Me"
    When I open the "About" navigation folder
    Then the mobile menu should contain "Projects"
    When I close the mobile menu
    Then the mobile menu should not be open

  Scenario: The blog lists its posts and a post shows its facts
    Given I am on "/news"
    Then the blog should list 3 posts
    And the blog post "Get Out There!" should be visible
    And the blog post "Our summer restock" should not be visible
    When I open the blog post "Get Out There!"
    Then the blog post title should be "Get Out There!"
    And the hero title should be "Get Out There!"
    And the blog post should show the author "Author Name"
    And the blog post should show the date "May 28"
    And "News" should be the current navigation item

  Scenario: The site search finds a page and reports no match
    Given I am on the homepage
    When I search the site for "news"
    Then the search results should contain "News"
    When I search the site for "zzzqqq"
    Then the search should find no results

  # No public template demo has an announcement bar or a cookie banner, so the
  # "Given" steps switch them on in the test browser; Squarespace's own scripts
  # then draw them. The site is not changed.
  Scenario: The announcement bar shows its text and link, and closes
    Given the announcement bar is switched on with the text "Free shipping on orders over 50" linking to "/news"
    And I am on the homepage
    Then the announcement bar should be visible
    And the announcement bar should say "Free shipping on orders over 50"
    And the announcement bar should link to "/news"
    When I close the announcement bar
    Then the announcement bar should not be visible

  Scenario: The cookie banner shows its text and goes away when cookies are accepted
    Given the cookie banner is switched on with the text "We use cookies to improve your experience."
    And I am on the homepage
    Then the cookie banner should be visible
    And the cookie banner should say "We use cookies to improve your experience."
    When I accept the cookies
    Then the cookie banner should not be visible

  Scenario: Declining the cookies removes the banner
    Given the cookie banner is switched on with the text "We use cookies to improve your experience."
    And I am on the homepage
    When I decline the cookies
    Then the cookie banner should not be visible
