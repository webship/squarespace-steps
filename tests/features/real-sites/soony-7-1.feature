# Read-only checks of a public Squarespace 7.1 template demo (Soony). Its
# header has no page links; the facts, the footer and the forms are testable.
# The form block is filled in but never sent: it validates on the server and a
# submission is stored by Squarespace. The shop is only read: no product is
# added to a cart.
@real-site @soony
Feature: Squarespace 7.1 template demo (Soony)
  As a tester
  I want the steps to work on a template whose header has no page links
  So that a missing navigation is reported and not mistaken for a pass

  Scenario: The site facts and footer
    Given I am on "/shop"
    Then the site should use Squarespace 7.1
    And the site title should be "SOONY CANDLE"
    And the site footer should be visible
    And the footer navigation should contain "Shipping & Returns"
    And the footer navigation should contain "Contact"

  Scenario: The header shows no navigation items
    Given I am on "/shop"
    Then the site navigation should not be visible

  Scenario: The form block is filled but not sent
    Given I am on "/contact"
    When I fill in the form field "First Name" with "Jane"
    And I fill in the form field "Last Name" with "Doe"
    And I fill in the form field "Email" with "subscriber@example.com"
    And I choose "Press inquiry" for the form field "Inquiry"
    And I fill in the form field "Message" with "Hello"

  Scenario: The newsletter form stops an empty email address in the browser
    Given I am on "/contact"
    When I submit the newsletter form
    Then the newsletter form should show an error for the field "Email Address"
    And the newsletter form should show the error "Email Address is required."
    And the newsletter form should not show the submitted confirmation

  Scenario: The shop lists its products
    Given I am on "/shop"
    Then the shop should list 6 products
    And the shop should list the product "Genuine Gemini"
    And the shop should not list the product "Gift card"
    And the cart should contain 0 items

  Scenario: A product page shows its title, price and quantity
    Given I am on "/shop"
    When I open the product "Genuine Gemini"
    Then the product title should be "Genuine Gemini"
    And the product price should be "$25.00"
    When I set the product quantity to 2

  Scenario: The cart link opens the cart page
    Given I am on "/shop"
    When I open the cart
    Then I should be on "/cart"
    And the cart should contain 0 items
