#!/usr/bin/env python3
"""
Replace the categories field in all dc-pride-2026 event .md files
with the new category taxonomy.
"""

import re
from pathlib import Path

EVENTS_DIR = Path("content/events/dc-pride-2026")

CATEGORY_MAP = {
    "1k_bottles_rooftop_day_party_finale_hosted_by_kellon_deryck": ["Pride", "Day Party", "Nightlife"],
    "300_men_elevated_day_party": ["Pride", "Day Party"],
    "5th_annual_saturdazed_the_ultimate_day_party": ["Pride", "Day Party"],
    "7th_annual_brunch_badies": ["Pride", "Food", "Social"],
    "a_party_in_the_district": ["Pride", "Nightlife"],
    "afroqueer_presents_one_for_the_road_day_party": ["Pride", "Day Party"],
    "all_gays_go_to_prison": ["Pride", "Performance"],
    "art_activated_dc_black_pride": ["Pride", "Arts & Culture"],
    "black_pride_brunch": ["Pride", "Food", "Social"],
    "black_sugar_district_after_dark": ["Pride", "Nightlife", "Sapphic"],
    "block_is_hot_mega_day_party": ["Pride", "Day Party"],
    "boozy_blackout": ["Pride", "Nightlife"],
    "bounce_friday": ["Pride", "Social"],
    "brunch_in_the_district": ["Pride", "Food", "Social"],
    "daryl_wilson_bachelor_party": ["Pride", "Nightlife", "Social"],
    "dc_pride_boozy_in_the_district": ["Pride", "Nightlife"],
    "ditd_dc_pride_day_party": ["Pride", "Day Party"],
    "ditd_dc_pride_feel_good_fridaze": ["Pride", "Nightlife"],
    "do_you_want_to_get_funky_with_me": ["Pride", "Day Party", "Sapphic"],
    "dres_6th_annual_cookout": ["Pride", "Food", "Social"],
    "elevateent_mdw_kickoff_year_2": ["Pride", "Nightlife"],
    "freakquency_presents_the_black_solstice": ["Pride", "Nightlife"],
    "freakquency_presents_the_blackout_dc_pride_edition": ["Pride", "Nightlife"],
    "fresh_happy_hour_of_dc": ["Pride", "Social", "Food"],
    "game_night_x_deviant_events": ["Pride", "Social"],
    "gpmc_presents_create_in_color": ["Pride", "Arts & Culture", "Professional/Networking"],
    "gspot_ultimate_day_party": ["Pride", "Day Party"],
    "hot_boyz_takeover_day_party": ["Pride", "Day Party"],
    "house_and_ballroom_leadership_summit": ["Ballroom", "Educational", "Professional/Networking"],
    "its_5_oclock_somewhere": ["Pride", "Social"],
    "jerrells_memorial_day_brunch": ["Pride", "Food", "Social"],
    "karaoke_w_lit_parties_dc": ["Pride", "Nightlife", "Performance"],
    "karaoke_wednesdays_at_thurst": ["Pride", "Performance", "Social"],
    "lick_pride_finale": ["Pride", "Nightlife", "Sapphic"],
    "lit_party": ["Pride", "Nightlife"],
    "mary_bowman_poetry_slam_and_open_mic": ["Pride", "Performance", "Arts & Culture"],
    "meatloaf_cookout_day_party": ["Pride", "Day Party", "Food"],
    "meatloaf_manhunt_rooftop": ["Pride", "Nightlife"],
    "memorial_play_cookout": ["Pride", "Food", "Social"],
    "midnight_melt_the_ultimate_indulgence": ["Pride", "Nightlife", "Sapphic"],
    "mr_and_miss_dc_black_pride_pageant": ["Pride", "Performance", "Ballroom"],
    "new_black_renaissance_generations_social": ["Pride", "Social", "Professional/Networking"],
    "oasis_day_party_festival": ["Pride", "Day Party", "Festival", "Sapphic"],
    "outspoken": ["Pride", "Performance", "Arts & Culture"],
    "penthouse_pool_vibez": ["Pride", "Pool Party"],
    "pride_in_the_district_glow_stick_stop_light_party": ["Pride", "Nightlife"],
    "pride_in_the_district_official_main_event": ["Pride", "Nightlife"],
    "pride_in_the_district_sunset_day_party": ["Pride", "Day Party"],
    "pride_in_the_district_sweat_rooftop_day_party": ["Pride", "Day Party"],
    "pride_in_the_district_weekend_kickoff_night_party": ["Pride", "Nightlife"],
    "pride_in_the_district_welcome_party": ["Pride", "Social"],
    "pride_in_the_park": ["Pride", "Festival", "Social"],
    "pride_in_the_park_after_party": ["Pride", "Nightlife", "Social"],
    "quenchfest_baddies_on_baddies": ["Pride", "Nightlife"],
    "quenchfest_monday_motion": ["Pride", "Social"],
    "quenchfest_sip_slide": ["Pride", "Social"],
    "quenchfest_sunday_funday": ["Pride", "Social"],
    "rb_vs_house_dc_black_pride_2026_two_floors_experience": ["Pride", "Nightlife"],
    "reggie_riich_after_hours_vol1_unlocked": ["Pride", "Nightlife"],
    "reggie_riich_after_hours_vol2_ctrl_mode": ["Pride", "Nightlife"],
    "reggie_riich_after_hours_vol3_override": ["Pride", "Nightlife"],
    "save_the_last_dance_for_us": ["Pride", "Nightlife"],
    "splash_dc_memorial_day_weekend_pool_party": ["Pride", "Pool Party"],
    "sunday_funday_rooftop_party": ["Pride", "Day Party"],
    "sunday_funday_w_lit_parties_dc": ["Pride", "Day Party"],
    "sunday_service_brunch_by_boozy_bounce": ["Pride", "Food", "Social"],
    "super_sunday_party": ["Pride", "Nightlife"],
    "sweet_like_brown_sugar_brunch": ["Pride", "Food", "Social", "Sapphic"],
    "the_1_afrobeats_night_pride_party_in_the_usa": ["Pride", "Nightlife"],
    "the_3000_men_block_party": ["Pride", "Nightlife"],
    "the_all_white_party": ["Pride", "Nightlife"],
    "the_big_boy_convergence": ["Pride", "Nightlife", "Sex+/Body+"],
    "the_big_boy_convergence_sunday_funday": ["Pride", "Day Party", "Sex+/Body+"],
    "the_jump_off": ["Pride", "Nightlife"],
    "the_pre_game": ["Pride", "Nightlife"],
    "the_shift_dc_pride_finale": ["Pride", "Nightlife"],
    "tru_sundaze_presents_night_mode": ["Pride", "Nightlife"],
    "uncle_js_meet_greet": ["Pride", "Social", "Sex+/Body+"],
    "unleashed_dc_sweet_beginnings": ["Pride", "Nightlife", "Sapphic"],
    "us_against_the_world_album_release_party": ["Pride", "Performance", "Arts & Culture"],
    "voices_for_equality_moving_hearts_changing_minds_through_storytelling": ["Educational", "Activism", "Arts & Culture"],
    "welcome_reception": ["Pride", "Social"],
    "welcome_reception_pass_distribution": ["Pride", "Social"],
    "x_rated_sunday": ["Pride", "Nightlife", "Sex+/Body+"],
}


def categories_to_yaml(cats: list[str]) -> str:
    items = ", ".join(f"'{c}'" for c in cats)
    return f"categories: [{items}]"


def patch_file(path: Path, new_cats: list[str]) -> bool:
    text = path.read_text(encoding="utf-8")
    new_line = categories_to_yaml(new_cats)
    new_text = re.sub(
        r"^categories: \[.*?\]",
        new_line,
        text,
        flags=re.MULTILINE,
    )
    if new_text == text:
        return False
    path.write_text(new_text, encoding="utf-8")
    return True


def main():
    updated = skipped = missing = 0
    for stem, cats in sorted(CATEGORY_MAP.items()):
        path = EVENTS_DIR / f"{stem}.md"
        if not path.exists():
            print(f"  ✗  NOT FOUND: {stem}.md")
            missing += 1
            continue
        changed = patch_file(path, cats)
        if changed:
            print(f"  ✓  {stem}.md")
            updated += 1
        else:
            skipped += 1

    print(f"\nUpdated: {updated}  Skipped (no change): {skipped}  Not found: {missing}")


if __name__ == "__main__":
    main()
