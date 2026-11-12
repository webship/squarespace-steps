# Read-only checks of a public Squarespace 7.1 template demo (Loam). Its
# navigation labels are written in capitals in the page source, so the labels
# below are capitals too. Run with `npm run test:real-sites`.
@real-site @loam
Feature: Squarespace 7.1 template demo (Loam)
  As a tester
  I want the steps to compare labels exactly as the page writes them
  So that a label in capitals is not confused with one in lower case

  Scenario: The navigation labels keep their case
    Given I am on "/blog"
    Then the site navigation should contain "BLOG"
    And the site navigation should not contain "Blog"
    And "BLOG" should be the current navigation item
    And the site title should be "LOAM BAKERY"

  Scenario: The footer links
    Given I am on "/blog"
    Then the site footer should be visible
    And the footer navigation should contain "Instagram"

  Scenario: The blog lists its posts
    Given I am on "/blog"
    Then the blog should list 4 posts
    And the blog post "Our Classic Croissant Recipe" should be visible
    And the blog post "Our classic croissant recipe" should not be visible
