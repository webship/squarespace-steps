# The copy and paths below are those of the demo site in demo-site/; swap them
# for your own content when you copy this feature. The first two lines of each
# scenario switch the bar or the banner on in the browser (a test aid in
# tests/step-definitions/support/); on your own site that has them on, drop
# them.
Feature: Announcement bar and cookie banner
  As a visitor
  I want to read the announcement and choose my cookies
  So that I know the news of the site and stay in control of my data

  Scenario: The announcement bar shows its text and link
    Given the announcement bar is switched on with the text "Free shipping on orders over 50" linking to "/shop.html"
    And I am on the homepage
    Then the announcement bar should be visible
    And the announcement bar should say "Free shipping on orders over 50"
    And the announcement bar should link to "/shop.html"
    But the announcement bar should not say "Closed on Monday"
    And the announcement bar should not link to "/contact.html"

  Scenario: Closing the announcement bar hides it
    Given the announcement bar is switched on with the text "Free shipping on orders over 50" linking to "/shop.html"
    And I am on the homepage
    When I close the announcement bar
    Then the announcement bar should not be visible

  Scenario: A site without an announcement bar shows none
    Given I am on the homepage
    Then the announcement bar should not be visible

  Scenario: The cookie banner shows its text and goes away when cookies are accepted
    Given the cookie banner is switched on with the text "We use cookies to improve your experience."
    And I am on the homepage
    Then the cookie banner should be visible
    And the cookie banner should say "We use cookies to improve your experience."
    When I accept the cookies
    Then the cookie banner should not be visible

  Scenario: Declining the cookies removes the banner too
    Given the cookie banner is switched on with the text "We use cookies to improve your experience."
    And I am on the homepage
    When I decline the cookies
    Then the cookie banner should not be visible

  Scenario: The choice is kept on the next page
    Given the cookie banner is switched on with the text "We use cookies to improve your experience."
    And I am on the homepage
    When I accept the cookies
    And I am on the "/about.html" page
    Then the cookie banner should not be visible

  Scenario: A site without a cookie banner shows none
    Given I am on the homepage
    Then the cookie banner should not be visible
