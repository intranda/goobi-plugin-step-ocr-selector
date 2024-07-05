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
        }
    });

    grunt.loadNpmTasks('grunt-riot');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['riot']);

};
