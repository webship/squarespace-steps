# The copy, counts and paths below are those of the demo site in demo-site/; swap
# them for your own content when you copy this feature.
Feature: Blog page
  As a visitor
  I want to read the latest journal entries
  So that I can learn more about the studio's craft

  Background:
    Given I am on the "/blog.html" page

  Scenario: Blog lists recent posts
    Then the blog should list 2 posts
    And the blog post "Seasoning a cutting board the right way" should be visible
    And the blog post "Why we use linen instead of canvas" should be visible

  Scenario: Navigation marks Blog as current
    Then "Blog" should be the current navigation item

  @mobile
  Scenario: Blog listing remains usable on mobile
    When I set the viewport to the "mobile" breakpoint
    And I am on the "/blog.html" page
    Then the blog should list 2 posts
