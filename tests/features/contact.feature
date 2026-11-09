# The copy, counts and paths below are those of the demo site in demo-site/; swap
# them for your own content when you copy this feature.
Feature: Contact page
  As a visitor
  I want to send a message to the studio
  So that I can ask questions before buying

  Background:
    Given I am on the "/contact.html" page

  Scenario: Navigation marks Contact as current
    Then "Contact" should be the current navigation item

  Scenario: Submitting the contact form shows a confirmation
    When I fill in the Squarespace form field "Name" with "Jane Doe"
    And I fill in the Squarespace form field "Email" with "jane@example.com"
    And I fill in the Squarespace form field "Message" with "Hello, I love your work!"
    And I submit the Squarespace form
    Then the Squarespace form should show the submitted confirmation

  @mobile
  Scenario: Contact form remains usable on mobile
    When I set the viewport to the "mobile" breakpoint
    And I am on the "/contact.html" page
    Then I should see "Contact us"
    And the mobile navigation toggle should be visible
