/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
import { byTestId, login } from '../support/utils';

describe('Ensolvers QA To-do app', () => {
  xit('#001 Sign in', () => {
    login();
    cy.visit('');
  });

  xit('#002 Logout', () => {
    login();
    cy.visit('');

    byTestId('accountMenu').click();
    byTestId('logout').click();

    cy.contains(`Logged out successfully!`);
  });

  xit('#003 Add a new to do item', () => {
    cy.intercept({
      method: 'POST',
      url: '/api/to-do-items',
    }).as('createTodoItem');

    login();
    cy.visit('');

    cy.get('button').contains('Manage To-Do Items').click();

    byTestId('ToDoItemHeading').contains('To Do Items');

    byTestId('entityCreateButton').click();
    byTestId('ToDoItemCreateUpdateHeading').contains('Create or edit a ToDoItem');

    const title = faker.lorem.sentence();

    byTestId('title').should('be.visible').type(title);
    byTestId('description').should('be.visible');
    byTestId('folder').should('be.visible');

    byTestId('entityCreateSaveButton').click();

    cy.wait('@createTodoItem').then((interception) => {
      const { id, title } = interception.response.body;

      byTestId('entityTable').contains(id).get('td').contains(title);
    });
  });

  it('#004 Edit an existing to do item', () => {
    cy.intercept({
      method: 'PUT',
      url: '/api/to-do-items/*',
    }).as('editTodoItem');

    login();
    cy.visit('/to-do-item');

    byTestId('entityTable')
      .first()
      .within(($row) => {
        cy.get('a[data-cy="entityEditButton"]').click();
      });

    byTestId('ToDoItemCreateUpdateHeading').contains('Create or edit a ToDoItem');

    cy.get('#to-do-item-id').should('be.visible').should('have.attr', 'readonly');
    byTestId('title').should('be.visible');

    const description = faker.lorem.sentence();
    byTestId('description').should('be.visible').type(description);
    byTestId('folder').should('be.visible');

    byTestId('entityCreateSaveButton').click();

    cy.wait('@editTodoItem').then((interception) => {
      const { id, title, description } = interception.response.body;

      byTestId('entityTable').contains(id).get('td').contains(description);
    });
  });
});
