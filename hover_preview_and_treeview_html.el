(eval-after-load "org"
  '(org-add-link-type
    "hover" #'ignore ; not an 'openable' link
    #'(lambda (class desc format)
        (pcase format
          (`html (format "<a href=\"%s\">%s<span><img src=\"%s\"/></span></a>"
                         (mapconcat 'identity (cdr (split-string (or desc "") ":")) ":")
                         (car (split-string (or desc "") ":"))
                         class))
          (_ (or desc ""))))))


    (use-package htmlize)

    (defun htmlize-string (@input-str)
      "Take @input-str and return a htmlized version.
    The purpose is to syntax color source code in HTML.

    This function requires the `htmlize-buffer' from htmlize.el by Hrvoje Niksic.

    See http://ergoemacs.org/emacs/elisp_htmlize.html"
      (interactive)
      (let ($output-buff
            $resultStr)
        ;; put code in a temp buffer, set the mode, fontify
        (with-temp-buffer
          (insert @input-str)
          (org-mode)
          (font-lock-ensure)
          (setq $output-buff (htmlize-buffer)))
        ;; extract the fontified source code in htmlize output
        (with-current-buffer $output-buff
          (let ($p1 $p2 )
            (setq $p1 (search-forward "<pre>"))
            (setq $p2 (search-forward "</pre>"))
            (setq $resultStr (buffer-substring-no-properties (+ $p1 1) (- $p2 6)))))
        (kill-buffer $output-buff)
        $resultStr ))

    (defun htmlize-myregion (@p1 @p2)
      "Htmlized region @p1 @p2.
    This function requires the `htmlize-buffer' from htmlize.el by Hrvoje Niksic."
      (interactive
       (list (region-beginning)
             (region-end)))
      (let* (
             ($input-str (buffer-substring-no-properties @p1 @p2))
             ($out-str (htmlize-string $input-str)))
        (if (string-equal $input-str $out-str)
            nil
          (progn
            (delete-region @p1 @p2)
            (insert $out-str)))))


    (defun remove_leading_asterisks ()
      "Promote the heading at point to level 0 by Removing leading asterisks."
      (interactive)
      (progn
        (search-forward-regexp "^\\*+ " nil t)
        (replace-match "")
       )
    )

    (defun encapsulate_heading ()
      (progn
      (setq contentstr (org-element-property :begin (org-element-at-point)))
      (setq contentend (org-element-property :end (org-element-at-point)))
      ;;(print (org-element-property :raw-value (org-element-at-point)))
      ;;(print (org-element-property :level (org-element-at-point)))
      (goto-char contentend)
      (insert "\n#\+HTML:</ul></li>\n")
      (goto-char contentstr)
      (setq contentmid (org-element-property :contents-begin (org-element-at-point)))
      (goto-char contentmid)
      (insert "#\+HTML:<ul class=\"nested\">\n")
      (goto-char contentstr)
      (remove_leading_asterisks)
      (beginning-of-line)
      (insert "#\+HTML:<li><span class=\"caret\">")
      (if (re-search-forward " {{leaf}}" (line-end-position) t)
          (progn (replace-match "</span>")
           (htmlize-myregion (point) (line-end-position))
          )
          (progn (end-of-line) (insert "</span>"))
      )
      )
    )

    (defun indent_tree ()
      (setq curlevel (org-element-property :level (org-element-at-point)))
      (insert "#\+HTML:")
      (while (> curlevel 1)
        (insert "<ul>") (setq curlevel (1- curlevel)))
      (insert "\n")
    )

    (defun org-html-w-treeview ()
      "Test hint string"
      (with-output-to-temp-buffer "*html_tree_temp_out*"
        (let ((old-buffer (current-buffer)))
      (setq outfile (concat (file-name-sans-extension buffer-file-name) ".html"))
          (with-temp-buffer
      (insert-buffer-substring old-buffer)
      (org-mode)

      (beginning-of-buffer)
      (insert "#\+HTML_HEAD: <link rel=\"stylesheet\" type=\"text/css\" href=\"static/zenscroll.css\"/>\n")
      (insert "#\+HTML_HEAD: <script type=\"text/javascript\" src=\"static/zenscroll.js\"></script>\n")
      (insert "#\+OPTIONS: num:nil title:t\n")
      (while (search-forward-regexp "^\*+ {{tree}}" nil t)
        (beginning-of-line)
        (indent_tree)
        (re-search-forward " {{tree}}" nil t)
        (replace-match "")
        (end-of-line)
        (org-map-entries 'encapsulate_heading nil 'tree)
      ) ; while
      (beginning-of-buffer)
      (while (search-forward-regexp "^\*+ {{endtree}}" nil t)
        (beginning-of-line)
        (delete-region (point) (line-end-position))
        (insert "#+HTML: </div>")
        ) ; while
	    (org-export-to-file 'html outfile)
      (kill-buffer (current-buffer))
          ) ; with-temp...
        ) ; let
       ) ; with-output-...
    ) ; defunc

(progn (org-html-w-treeview)
) ; progn
