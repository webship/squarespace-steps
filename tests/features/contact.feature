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

  Scenario: A form submitted empty shows an error on every required field
    When I submit the Squarespace form
    Then the Squarespace form should show an error for the field "First Name"
    And the Squarespace form should show an error for the field "Email"
    And the Squarespace form should show an error for the field "Inquiry"
    And the Squarespace form should show an error for the field "Message"
    And the Squarespace form should show the error "Email is required."
    And the Squarespace form should not show the submitted confirmation

  Scenario: A field that was filled in keeps no error
    When I fill in the Squarespace form field "Email" with "subscriber@example.com"
    And I choose "Press inquiry" for the Squarespace form field "Inquiry"
    And I submit the Squarespace form
    Then the Squarespace form should not show an error for the field "Email"
    And the Squarespace form should not show an error for the field "Inquiry"
    And the Squarespace form should show an error for the field "Message"
    And the Squarespace form should not show the error "Email is required."

  Scenario: Submitting the contact form shows a confirmation
    When I fill in the Squarespace form field "First Name" with "Jane"
    And I fill in the Squarespace form field "Last Name" with "Doe"
    And I fill in the Squarespace form field "Email" with "jane@example.com"
    And I choose "Customer service" for the Squarespace form field "Inquiry"
    And I fill in the Squarespace form field "Message" with "Hello, I love your work!"
    And I submit the Squarespace form
    Then the Squarespace form should show the submitted confirmation

  Scenario: The newsletter form stops an empty email address
    When I submit the newsletter form
    Then the newsletter form should show an error for the field "Email Address"
    And the newsletter form should show the error "Email Address is required."
    And the newsletter form should not show the submitted confirmation

  Scenario: The newsletter form stops a wrong email address
    When I fill in the newsletter form field "Email Address" with "not-an-address"
    And I submit the newsletter form
    Then the newsletter form should show the error "Email Address is not valid."

  Scenario: The newsletter form confirms a sign-up
    When I fill in the newsletter form field "Email Address" with "subscriber@example.com"
    And I submit the newsletter form
    Then the newsletter form should show the submitted confirmation
    And the newsletter form should not show an error for the field "Email Address"

  @mobile
  Scenario: Contact form remains usable on mobile
    When I set the viewport to the "mobile" breakpoint
    And I am on the "/contact.html" page
    Then I should see "Contact us"
    And the mobile navigation toggle should be visible
    And I fill in the Squarespace form field "Email" with "subscriber@example.com"
