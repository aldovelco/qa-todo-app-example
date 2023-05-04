/// <reference types="cypress" />

import { byTestId, login } from '../support/utils';

describe('Ensolvers QA To-do app', () => {
  it('#001 Sign in', () => {
    login();

    cy.visit('');
  });

  it('#002 Logout', () => {
    login();

    cy.visit('');

    byTestId('accountMenu').click();
    byTestId('logout').click();


    cy.contains(`Logged out successfully!`);
  });
});
