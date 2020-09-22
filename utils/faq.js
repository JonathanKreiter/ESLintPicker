/* 
{question: '',
    answer: ''},
*/

const faq = [
    {question: 'can I import an alias file even though a eslint config exists in my project directory?', 
    answer: 'No. You will need to either save your eslint config or delete it. The alias file is renamed as \'eslint.rc*\' when it is imported. If one exists, it will not import.'},
    {question: 'will my saved configs be delete with every update?', answer: 'They will be deleted. Be careful! Currently working on a solution to this issue.'},
]

module.exports = faq; 