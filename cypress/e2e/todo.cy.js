/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
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

  it('#003 Add a new to do item', () => {
    cy.intercept({ method: 'POST', url: '/api/to-do-items' }).as('createTodoItem');

    login();
    cy.visit('');

    cy.get('button').contains('Manage To-Do Items').click();

    byTestId('ToDoItemHeading').contains('To Do Items');

    byTestId('entityCreateButton').click();
    byTestId('ToDoItemCreateUpdateHeading').contains('Create or edit a ToDoItem');

    const title = faker.lorem.sentence(3);
    byTestId('title').should('be.visible').clear().type(title);
    byTestId('description').should('be.visible');
    byTestId('folder').should('be.visible');

    byTestId('entityCreateSaveButton').click();

    cy.wait('@createTodoItem').then((interception) => {
      const { id, title } = interception.response.body;

      byTestId('entityTable').contains(id).get('td').contains(title);
    });
  });

  it('#004 Edit an existing to do item', () => {
    cy.intercept({ method: 'PUT', url: '/api/to-do-items/*' }).as('editTodoItem');

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

    const description = faker.lorem.sentence(5);
    byTestId('description').should('be.visible').clear().type(description);
    byTestId('folder').should('be.visible');

    byTestId('entityCreateSaveButton').click();

    cy.wait('@editTodoItem').then((interception) => {
      const { id, title, description } = interception.response.body;

      byTestId('entityTable').contains(id).get('td').contains(description);
    });
  });

  it('#005 View to do item details', () => {
    cy.intercept({ method: 'GET', url: '/api/to-do-items/*' }).as('viewTodoItem');

    login();
    cy.visit('/to-do-item');

    byTestId('entityTable')
      .first()
      .within(($row) => {
        cy.get('a[data-cy="entityDetailsButton"]').click();
      });

    byTestId('toDoItemDetailsHeading').contains('ToDoItem');

    cy.wait('@viewTodoItem').then((interception) => {
      const { id, title, description, user, folder } = interception.response.body;

      cy.contains('ID');
      cy.contains(id);

      cy.contains('Title');
      cy.contains(title);

      cy.contains('Description');
      cy.contains(description);

      cy.contains('User');
      cy.contains(user.login);

      cy.contains('Folder');

      if (folder) {
        cy.contains(folder.id);
      }
    });
  });

  it('Sort to do items', () => {
    login();
    cy.visit('/to-do-item');

    cy.location().should((loc) => {
      expect(loc.search).to.eq('?page=1&sort=id,asc');
    });

    cy.get('thead > tr').contains('Title').click();

    cy.location().should((loc) => {
      expect(loc.search).to.eq('?page=1&sort=title,desc');
    });
  });

  it('#006 Delete a to do item', () => {
    cy.intercept({ method: 'GET', url: /\/api\/to-do-items\?/ }).as('todoItems');
    cy.intercept({ method: 'GET', url: '/api/to-do-items/*' }).as('viewTodoItem');
    cy.intercept({ method: 'DELETE', url: '/api/to-do-items/*' }).as('deleteTodoItem');

    login();
    cy.visit('/to-do-item');

    let count = 0;
    cy.wait('@todoItems').then((interception) => {
      count = interception.response.body.length;
    });

    byTestId('entityTable')
      .last()
      .within(($row) => {
        cy.get('a[data-cy="entityDeleteButton"]').click();
      });

    cy.wait('@viewTodoItem');

    byTestId('toDoItemDeleteDialogHeading').contains('Confirm delete operation');
    byTestId('entityConfirmDeleteButton').click();

    cy.wait('@deleteTodoItem');
    cy.wait('@todoItems').then((interception) => {
      expect(interception.response.body.length).lessThan(count);
    });
  });

  it('#007 Refresh the table', () => {
    cy.intercept({ method: 'GET', url: /\/api\/to-do-items*/ }).as('todoItems');

    login();
    cy.visit('/to-do-item');

    cy.wait('@todoItems');
    cy.location().should((loc) => {
      expect(loc.search).to.eq('?page=1&sort=id,asc');
    });

    cy.get('thead > tr').contains('Title').click();

    cy.wait('@todoItems');
    cy.location().should((loc) => {
      expect(loc.search).to.eq('?page=1&sort=title,desc');
    });

    cy.get('button').contains('Refresh List').click();

    cy.wait('@todoItems');
    cy.location().should((loc) => {
      expect(loc.search).to.eq('?page=1&sort=title,desc');
    });
  });
});
