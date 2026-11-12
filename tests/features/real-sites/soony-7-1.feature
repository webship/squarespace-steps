# Read-only checks of a public Squarespace 7.1 template demo (Soony). Its
# header has no page links; the facts and the footer are still testable.
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
