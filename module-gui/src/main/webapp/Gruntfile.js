module.exports = function(grunt) {

    grunt.initConfig({
        riot: {
            options:{
                //template : 'jade',
                //type : 'coffeescript'
                concat: true
            },
            dist: {
                expand: false,
                src: 'tags/*.tag',
                dest: 'resources/dist/intranda_step_ocrselector/js/tags.js',
            }
        },
        watcher: {
            scripts: {
                files: ['tags/*.tag', 'css/*.css'],
                tasks: ['riot', 'copy'],
                options: {
                    spawn: false,
                },
            },
        }
    });

    grunt.loadNpmTasks('grunt-riot');
    grunt.loadNpmTasks('grunt-watcher');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['riot', 'watcher']);

};
