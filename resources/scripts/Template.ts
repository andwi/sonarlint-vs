class Template {
    static RuleMenuItem: HandlebarsTemplateDelegate = <any>'<li><a  class="rule-link" href="#version={{currentVersion}}&ruleId={{rule.Key}}" title="{{rule.Title}}">{{rule.Title}}</a></li>';
    static RuleMenuHeaderVersion: HandlebarsTemplateDelegate = <any>'<h2>List of rules</h2><span id="rule-version"><a class="rule-link" href="#version={{currentVersion}}">in version {{currentVersion}}</span></a>';
    static RuleMenuHeaderVersionError: HandlebarsTemplateDelegate = <any>'<span id="rule-version"><a href="#">Go to latest version</span></a>';
    static RulePageContent: HandlebarsTemplateDelegate = <any>(
        '<div class="rule-details">' +
            '<div class="rule-meta">' +
                '<h1 id="rule-title">{{Title}}</h1>' +
                '<span id="rule-id" class="id">Rule ID: {{Key}}</span>' +
                '<div class="rules-detail-properties">' +
                    '<span class="tags" id="rule-tags" style="{{{rule-tags-visibility Tags}}}">{{rule-tags-render Tags}}</span>' +
                '</div>' +
            '</div>' +
            '<div class="rule-description" id="rule-description">{{{Description}}}</div>' +
        '</div>');
    static RuleErrorPageContent: HandlebarsTemplateDelegate = <any>(
        '<div class="rule-details">' +
            '<div class="rule-meta">' +
                '<h1 id="rule-title">Error</h1>' +
                '<span id="rule-id" class="id">{{message}}</span>' +
            '</div>' +
        '</div>');
    static RuleFilterElement: HandlebarsTemplateDelegate = <any>'<li><input type="checkbox" checked="checked" id="{{tag}}" /><label for="{{tag}}">{{tag}}</label></li>';


    private static init() {
        Handlebars.registerHelper('rule-tags-visibility', function (tags) {
            if (!tags) {
                return 'visibility: hidden;'
            }
            return '';
        });

        Handlebars.registerHelper('rule-tags-render', function (tags) {
            return tags.join(', ');
        });

        Template.RuleMenuItem = Handlebars.compile(Template.RuleMenuItem);
        Template.RuleMenuHeaderVersion = Handlebars.compile(Template.RuleMenuHeaderVersion);
        Template.RuleMenuHeaderVersionError = Handlebars.compile(Template.RuleMenuHeaderVersionError);
        Template.RulePageContent = Handlebars.compile(Template.RulePageContent);
        Template.RuleErrorPageContent = Handlebars.compile(Template.RuleErrorPageContent);
        Template.RuleFilterElement = Handlebars.compile(Template.RuleFilterElement);
    }

    static eval(template: HandlebarsTemplateDelegate, context: any): string {
        return template(context);
    }

    private static hack_static_run = Template.init();
}