export const byTestId = (testId) => {
  return cy.get(`[data-cy="${testId}"]`);
};

export const login = (credentials = Cypress.env('credentials')) => {
  const { username, password } = credentials;

  return cy.session(
    username,
    () => {
      cy.visit('/login');

      byTestId('loginTitle').should('contain.text', 'Sign in');

      byTestId('username').type(username);
      byTestId('password').type(password, { log: false });
      cy.get('input[name="rememberMe"]').click();
      byTestId('submit').click();

      cy.contains(`You are logged in as "${username}".`);
    },
    {
      validate: () => {
        const baseUrl = Cypress.env('baseUrl');

        cy.getAllLocalStorage().then((result) => {
          expect(result[baseUrl]).to.have.property('jhi-authenticationToken');
        });
      },
    }
  );
};
