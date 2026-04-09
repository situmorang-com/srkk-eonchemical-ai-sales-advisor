<script lang="ts">
	export let segments: { label: string; value: number; color: string }[];
	export let centerLabel: string = '';
	export let centerSub: string = '';
	export let size: number = 160;

	$: total = segments.reduce((s, seg) => s + seg.value, 0);

	$: paths = (() => {
		const cx = size / 2;
		const cy = size / 2;
		const r = size * 0.38;
		const innerR = size * 0.24;
		let startAngle = -Math.PI / 2;
		return segments
			.filter((s) => s.value > 0)
			.map((seg) => {
				const angle = total > 0 ? (seg.value / total) * 2 * Math.PI : 0;
				const endAngle = startAngle + angle;
				const largeArc = angle > Math.PI ? 1 : 0;
				const x1 = cx + r * Math.cos(startAngle);
				const y1 = cy + r * Math.sin(startAngle);
				const x2 = cx + r * Math.cos(endAngle);
				const y2 = cy + r * Math.sin(endAngle);
				const ix1 = cx + innerR * Math.cos(endAngle);
				const iy1 = cy + innerR * Math.sin(endAngle);
				const ix2 = cx + innerR * Math.cos(startAngle);
				const iy2 = cy + innerR * Math.sin(startAngle);
				const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
				startAngle = endAngle;
				return { d, color: seg.color, label: seg.label, value: seg.value };
			});
	})();
</script>

<div class="flex flex-col items-center gap-4">
	<svg width={size} height={size} viewBox="0 0 {size} {size}" class="drop-shadow-sm">
		{#each paths as p}
			<path d={p.d} fill={p.color} stroke="white" stroke-width="2" />
		{/each}
		{#if centerLabel}
			<text x={size / 2} y={size / 2 - 6} text-anchor="middle" class="fill-gray-900 text-sm font-bold" font-size="14">{centerLabel}</text>
			{#if centerSub}
				<text x={size / 2} y={size / 2 + 10} text-anchor="middle" class="fill-gray-400" font-size="10">{centerSub}</text>
			{/if}
		{/if}
	</svg>
	<div class="flex flex-wrap justify-center gap-x-4 gap-y-1">
		{#each segments.filter((s) => s.value > 0) as seg}
			<div class="flex items-center gap-1.5">
				<div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: {seg.color}"></div>
				<span class="text-xs text-gray-600">{seg.label}</span>
				<span class="text-xs font-semibold text-gray-900">{seg.value}</span>
			</div>
		{/each}
	</div>
</div>
