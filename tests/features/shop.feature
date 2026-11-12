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
    And the shop should list the product "Ceramic Mug"
    And the shop should list the product "Linen Tote Bag"
    And the shop should list the product "Oak Cutting Board"
    But the shop should not list the product "Gift card"

  Scenario: Navigation marks Shop as current
    Then "Shop" should be the current navigation item

  Scenario: A product page shows its title and price
    When I open the product "Ceramic Mug"
    Then the product title should be "Ceramic Mug"
    And the product price should be "$24.00"
    But the product title should not be "Linen Tote Bag"
    And "Shop" should be the current navigation item

  Scenario: An empty cart counts as zero
    Then the cart should contain 0 items

  Scenario: Adding a single product to the cart
    When I add the product "Ceramic Mug" to the cart
    Then the cart should contain 1 item

  Scenario: Adding from the product page
    When I open the product "Linen Tote Bag"
    And I add the product to the cart
    Then the cart should contain 1 item

  Scenario: The quantity is added to the cart
    When I open the product "Oak Cutting Board"
    And I set the product quantity to 3
    And I add the product to the cart
    Then the cart should contain 3 items

  Scenario: The cart keeps its count on the next page
    When I add the product "Ceramic Mug" to the cart
    And I am on the "/shop.html" page
    And I add the product "Linen Tote Bag" to the cart
    And I open the cart
    Then I should be on "/cart"
    And the cart should contain 2 items

  @mobile
  Scenario: Product grid remains usable on mobile
    When I set the viewport to the "mobile" breakpoint
    And I am on the "/shop.html" page
    Then the shop should list 3 products
    And the mobile navigation toggle should be visible
    When I add the product "Ceramic Mug" to the cart
    Then the cart should contain 1 item
