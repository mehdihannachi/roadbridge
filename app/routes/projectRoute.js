    module.exports = function(app, transporter, passport) {
        var projectController = require('./../controllers/projectController')
        // var userController = require('./../controllers/userController.js')

        app.get('/project/show/:id', projectController.show);

        app.get('/projects', /*userController.isLoggedIn,*/ projectController.index);

        app.post('/project/delete/:id', /*userController.isLoggedIn,*/  projectController.delete);

        app.post('/project/update/:id', /*userController.isLoggedIn,*/  projectController.update);

        app.post('/project/draftUpdate/:id', /*userController.isLoggedIn,*/ projectController.publishDraft);
        
        app.post('/project/draft', /*userController.isLoggedIn,*/ projectController.saveDraft);

        app.post('/project/add', /*userController.isLoggedIn,*/ projectController.create);

        app.post('/project/many/delete', /*userController.isLoggedIn,*/ projectController.deleteSelected);

        app.post('/project/many/draft',/*userController.isLoggedIn,*/ projectController.draftSelected);
        
        app.post('/project/file_upload', projectController.file_upload);
    }
    