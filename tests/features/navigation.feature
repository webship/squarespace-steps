# The labels and paths below are those of the demo site in demo-site/; swap them
# for your own content when you copy this feature.
Feature: Site navigation
  As a visitor
  I want to find my way with the header navigation and the mobile menu
  So that I can reach every page on any screen

  Scenario: The header lists the pages and marks the current one
    Given I am on the homepage
    Then the site navigation should be visible
    And the site navigation should contain "Shop"
    And the site navigation should contain "Blog"
    And the site navigation should contain "Our story"
    And the site navigation should not contain "Checkout"
    And "Home" should be the current navigation item
    But "Shop" should not be the current navigation item

  Scenario: A folder holds its pages and is current when one of them is
    Given I am on "/contact.html"
    Then the "About" navigation folder should contain "Our story"
    And the "About" navigation folder should contain "Contact"
    And the "About" navigation folder should not contain "Shop"
    And "About" should be the current navigation item
    And "Contact" should be the current navigation item

  @desktop
  Scenario: A folder opens in the header on desktop
    Given I set the viewport to the "desktop" breakpoint
    And I am on the homepage
    When I open the "About" navigation folder
    Then I should see "Our story"

  @mobile
  Scenario: The burger button opens and closes the mobile menu
    Given I set the viewport to the "mobile" breakpoint
    And I am on the homepage
    Then the mobile navigation toggle should be visible
    And the site navigation should not be visible
    And the mobile menu should not be open
    When I open the mobile menu
    Then the mobile menu should be open
    And the mobile menu should contain "Shop"
    And the mobile menu should contain "Blog"
    When I close the mobile menu
    Then the mobile menu should not be open

  @mobile
  Scenario: A folder opens inside the mobile menu
    Given I set the viewport to the "mobile" breakpoint
    And I am on "/about.html"
    When I open the mobile menu
    And I open the "About" navigation folder
    Then the mobile menu should contain "Our story"
    And the mobile menu should contain "Contact"

  @desktop
  Scenario: The burger button is hidden on desktop
    Given I set the viewport to the "desktop" breakpoint
    And I am on the homepage
    Then the mobile navigation toggle should not be visible
