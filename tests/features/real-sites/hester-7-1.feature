# Read-only checks of a public Squarespace 7.1 template demo (Hester): a
# gallery section laid out as a grid. Run with `npm run test:real-sites`.
@real-site @hester
Feature: Squarespace 7.1 template demo (Hester)
  As a tester
  I want the gallery step to count the images of a real gallery grid
  So that the step is proven on the markup Squarespace renders

  Scenario: The gallery grid shows its images
    Given I am on the homepage
    Then the gallery should show 3 images
    And the site title should be "Hester"
