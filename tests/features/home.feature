Feature: Home page
  As a visitor
  I want to land on the home page
  So that I can see the hero message and find my way around the site

  Background:
    Given I am on the homepage

  Scenario: Hero section is shown
    Then the hero title should be "Handmade goods, honestly sourced."
    And the hero call-to-action button should link to "/shop.html"

  Scenario: Main navigation lists every main page
    Then the site navigation should contain "Home"
    And the site navigation should contain "Shop"
    And the site navigation should contain "About"
    And the site navigation should contain "Blog"
    And the site navigation should contain "Contact"
    And "Home" should be the current navigation item

  Scenario: Footer is present
    Then the site footer should be visible
    And the footer should show a copyright notice
    And the footer navigation should contain "Instagram"

  @mobile
  Scenario: Navigation collapses to a toggle on mobile
    When I set the viewport to the "mobile" breakpoint
    And I am on the homepage
    Then the mobile navigation toggle should be visible

  @desktop
  Scenario: Full navigation is shown on desktop
    When I set the viewport to the "desktop" breakpoint
    And I am on the homepage
    Then the site navigation should be visible
