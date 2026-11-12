# Read-only checks of a public Squarespace 7.0 template demo (Brine family).
# Run with `npm run test:real-sites`.
@real-site @brine
Feature: Squarespace 7.0 template demo (Brine)
  As a tester
  I want the steps to work on a Squarespace 7.0 site of the Brine family
  So that sites that have not moved to 7.1 can be tested too

  Scenario: The site reports its facts
    Given I am on "/blog-brine"
    Then the site should use Squarespace 7.0
    And the site should not use Squarespace 7.1

  Scenario: The header marks the current page
    Given I am on "/blog-brine"
    Then the site navigation should be visible
    And the site navigation should contain "Shop"
    And "Blog" should be the current navigation item
    But "Shop" should not be the current navigation item

  Scenario: The footer links
    Given I am on "/blog-brine"
    Then the site footer should be visible
    And the footer navigation should contain "Stockists"

  @mobile
  Scenario: The menu button opens and closes the mobile menu
    Given I set the viewport to the "mobile" breakpoint
    And I am on "/blog-brine"
    Then the mobile navigation toggle should be visible
    And the site navigation should not be visible
    When I open the mobile menu
    Then the mobile menu should be open
    And the mobile menu should contain "Shop"
    When I close the mobile menu
    Then the mobile menu should not be open
