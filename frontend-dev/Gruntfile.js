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
                dest: '../src/main/resources/frontend/js/tags.js',
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand:true, 
                        src: ['css/*.css'], 
                        dest: '../src/main/resources/frontend/'
                    },
                    {
                        expand:true, 
                        src: ['../src/main/resources/frontend/**'], 
                        dest: '/opt/digiverso/goobi/static_assets/plugins/intranda_step_ocrselector/',
                        rename: function(dest, src) {
                            return dest + ( src.replace(/^..\/src\/main\/resources\/frontend\/?/ ,"") );
                        }
                    } 
                ],
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

    grunt.registerTask('default', ['riot', 'copy', 'watcher']);

};
