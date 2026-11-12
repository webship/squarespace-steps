# The copy and paths below are those of the demo site in demo-site/; swap them
# for your own content when you copy this feature.
Feature: Site search
  As a visitor
  I want to search the site
  So that I can find a page without browsing

  Scenario: A search lists the pages that match
    Given I am on the homepage
    When I search the site for "linen"
    Then the search should find 3 results
    And the search results should contain "Shop"
    And the search results should contain "Linen Tote Bag"
    And the search results should contain "Why we use linen instead of canvas"
    But the search results should not contain "Contact"

  Scenario: A search with no match says so
    Given I am on the homepage
    When I search the site for "zzzqqq"
    Then the search should find no results

  Scenario: Searching again replaces the results
    Given I am on "/search"
    When I search the site for "contact"
    Then the search should find 1 result
    When I search the site for "story"
    Then the search results should contain "Our story"
    And the search results should not contain "Contact"
