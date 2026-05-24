# frozen_string_literal: true

module RedmineDoneRatioStep
  class Hooks < Redmine::Hook::ViewListener
    # Inject plugin JS + global config
    def view_layouts_base_html_head(_context = {})
      settings = Setting.plugin_redmine_done_ratio_step || {}

      enabled = (settings['enabled'].to_s == '1')
      step = settings['step'].to_i
      step = 5 if step <= 0
      step = 25 if step > 25

      cfg = { enabled: enabled, step: step }

      javascript_include_tag('done_ratio_step', plugin: 'redmine_done_ratio_step') +
        javascript_tag("window.DoneRatioStepConfig = #{cfg.to_json};")
    end

    # Preserve non-standard stored values (e.g., 15%) in issue edit form
    def view_issues_form_details_bottom(context = {})
      issue = context[:issue]
      return '' unless issue

      value = issue.done_ratio.to_i
      javascript_tag(<<~JS)
        (function () {
          var select = document.getElementById('issue_done_ratio');
          if (select) {
            select.setAttribute('data-done-ratio-current', '#{value}');
          }
          window.DoneRatioStepCurrentDoneRatio = #{value};
        })();
      JS
    end
  end
end
