# The copy, counts and paths below are those of the demo site in demo-site/; swap
# them for your own content when you copy this feature.
Feature: Shop page
  As a shopper
  I want to browse products and add them to my cart
  So that I can buy the things I like

  Background:
    Given I am on the "/shop.html" page

  Scenario: Shop lists the product catalog
    Then the shop should list 3 products
    And I should see "Ceramic Mug"
    And I should see "Linen Tote Bag"
    And I should see "Oak Cutting Board"

  Scenario: Navigation marks Shop as current
    Then "Shop" should be the current navigation item

  Scenario: Adding a single product to the cart
    When I add the product "Ceramic Mug" to the cart
    Then the cart should contain 1 item

  Scenario: Adding multiple products to the cart
    When I add the product "Ceramic Mug" to the cart
    And I add the product "Linen Tote Bag" to the cart
    Then the cart should contain 2 items

  @mobile
  Scenario: Product grid remains usable on mobile
    When I set the viewport to the "mobile" breakpoint
    And I am on the "/shop.html" page
    Then the shop should list 3 products
    And the mobile navigation toggle should be visible
