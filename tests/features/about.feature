Feature: About page
  As a visitor
  I want to read about the studio
  So that I understand who is behind the products

  Background:
    Given I am on the "/about.html" page

  Scenario: About page hero and copy are shown
    Then the hero title should be "About Demo Studio"
    And I should see "Our story"

  Scenario: Navigation marks About as current
    Then "About" should be the current navigation item

  Scenario: Footer is present
    Then the site footer should be visible

  @mobile
  Scenario: Navigation collapses to a toggle on mobile
    When I set the viewport to the "mobile" breakpoint
    And I am on the "/about.html" page
    Then the mobile navigation toggle should be visible
