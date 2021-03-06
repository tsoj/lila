import { Controller, Puzzle, PuzzleGame, MaybeVNode, PuzzleDifficulty } from '../interfaces';
import { dataIcon, onInsert } from '../util';
import { h } from 'snabbdom';
import { numberFormat } from 'common/number';
import { VNode } from 'snabbdom/vnode';

export function puzzleBox(ctrl: Controller): VNode {
  var data = ctrl.getData();
  return h('div.puzzle__side__metas', [
    puzzleInfos(ctrl, data.puzzle),
    gameInfos(ctrl, data.game, data.puzzle)
  ]);
}

function puzzleInfos(ctrl: Controller, puzzle: Puzzle): VNode {
  return h('div.infos.puzzle', {
    attrs: dataIcon('-')
  }, [h('div', [
    h('p', [
      ...ctrl.trans.vdom('puzzleId', h('a', {
        attrs: { href: `/training/${puzzle.id}` }
      }, '#' + puzzle.id))
    ]),
    h('p', ctrl.trans.vdom('ratingX', ctrl.vm.mode === 'play' ? h('span.hidden', ctrl.trans.noarg('hidden')) : h('strong', puzzle.rating))),
    h('p', ctrl.trans.vdom('playedXTimes', h('strong', numberFormat(puzzle.plays))))
  ])]);
}

function gameInfos(ctrl: Controller, game: PuzzleGame, puzzle: Puzzle): VNode {
  return h('div.infos', {
    attrs: dataIcon(game.perf.icon)
  }, [h('div', [
    h('p', ctrl.trans.vdom('fromGameLink', ctrl.vm.mode == 'play' ? h('span.hidden', ctrl.trans.noarg('hidden')) : h('a', {
      attrs: { href: `/${game.id}/${ctrl.vm.pov}#${puzzle.initialPly}` }
    }, '#' + game.id))),
    h('p', [
      game.clock, ' • ',
      game.perf.name, ' • ',
      ctrl.trans.noarg(game.rated ? 'rated' : 'casual')
    ]),
    h('div.players', game.players.map(p =>
      h('div.player.color-icon.is.text.' + p.color,
        p.userId ? h('a.user-link.ulpt', {
          attrs: { href: '/@/' + p.userId }
        }, p.name) : p.name
      )
    ))
  ])]);
}

export function userBox(ctrl: Controller): VNode {
  const data = ctrl.getData();
  if (!data.user) return h('div.puzzle__side__user', [
    h('p', ctrl.trans.noarg('toGetPersonalizedPuzzles')),
    h('button.button', { attrs: { href: '/signup' } }, ctrl.trans.noarg('signUp'))
  ]);
  const diff = ctrl.vm.round?.ratingDiff;
  return h('div.puzzle__side__user', [
    h('p.puzzle__side__user__rating', ctrl.trans.vdom('yourPuzzleRatingX', h('strong', [
      data.user.rating - (diff || 0),
      ...(diff && diff > 0 ? [' ', h('good.rp', '+' + diff)] : []),
      ...(diff && diff < 0 ? [' ', h('bad.rp', '−' + (-diff))] : [])
    ])))
  ]);
}

const difficulties: PuzzleDifficulty[] = ['easiest', 'easier', 'normal', 'harder', 'hardest'];

export function config(ctrl: Controller): MaybeVNode {

  const id = 'puzzle-toggle-autonext';
  return h('div.puzzle__side__config', [
    h('div.puzzle__side__config__jump', [
      h('div.switch', [
        h(`input#${id}.cmn-toggle.cmn-toggle--subtle`, {
          attrs: {
            type: 'checkbox',
            checked: ctrl.autoNext()
          },
          hook: {
            insert: vnode => (vnode.elm as HTMLElement).addEventListener('change', () =>
              ctrl.autoNext(!ctrl.autoNext()))
          }
        }),
        h('label', { attrs: { 'for': id } })
      ]),
      h('label', { attrs: { 'for': id } }, 'Jump to next puzzle immediately')
    ]),
    ctrl.difficulty ? h('form.puzzle__side__config__difficulty', {
      attrs: {
        action: `/training/difficulty/${ctrl.getData().theme.key}`,
        method: 'post'
      }
    }, [
      h('label', {
        attrs: { for: 'puzzle-difficulty' },
      }, ctrl.trans.noarg('difficultyLevel')),
      h('select#puzzle-difficulty.puzzle__difficulty__selector', {
        attrs: { name: 'difficulty' },
        hook: onInsert(elm => elm.addEventListener('change', () => (elm.parentNode as HTMLFormElement).submit()))
      }, difficulties.map(diff =>
        h('option', {
          attrs: {
            value: diff,
            selected: diff == ctrl.difficulty
          },
        }, ctrl.trans.noarg(diff))
      ))
    ]) : null
  ]);
}
