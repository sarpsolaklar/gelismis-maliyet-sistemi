with open('styles.css', 'a', encoding='utf-8') as f:
    f.write('''
/* Accordion Styles */
.accordion-content {
    display: none;
    flex-direction: column;
    margin-left: 0.5rem;
    padding-left: 0.5rem;
    border-left: 2px solid rgba(255,255,255,0.1);
    margin-bottom: 0.25rem;
}
.accordion-content.active {
    display: flex;
}
.accordion-header {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
    border-radius: 4px;
    padding-right: 4px;
}
.accordion-header:hover {
    background: rgba(255,255,255,0.03);
}
.chevron {
    display: inline-block;
    transition: transform 0.3s ease;
    font-size: 0.65rem;
    margin-left: 5px;
    opacity: 0.7;
    vertical-align: middle;
}
.accordion-header.open .chevron {
    transform: rotate(180deg);
}
[data-theme="light"] .accordion-content {
    border-left-color: rgba(0,0,0,0.1);
}
[data-theme="light"] .accordion-header:hover {
    background: rgba(0,0,0,0.03);
}
''')
